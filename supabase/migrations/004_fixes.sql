-- 004_fixes.sql
-- Addresses design issues found in audit (May 2026).
--
-- 1. ON DELETE SET NULL for all authored-content FKs
-- 2. handle_new_user uses full email as username (avoids prefix collision)
-- 3. notifications.kind gains a check constraint
-- 4. version_number / current_version promoted from smallint to integer
-- 5. notifications.read boolean replaced with read_at timestamptz (NULL = unread)
-- 6. proposals_reviewer_update policy gains WITH CHECK
-- 7. Trigger: sync_article_current_version keeps articles.current_version honest
-- 8. set_user_role raises when p_user_id is not found
-- 9. get_article_versions / accept_proposal updated for integer return type

-- ── 1. FK ON DELETE SET NULL ───────────────────────────────────────────────────
-- Without this, deleting any auth.users row that has authored content fails.

alter table public.articles
  drop constraint articles_created_by_fkey,
  add constraint articles_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.article_versions
  drop constraint article_versions_created_by_fkey,
  add constraint article_versions_created_by_fkey
    foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.comments
  drop constraint comments_author_id_fkey,
  add constraint comments_author_id_fkey
    foreign key (author_id) references public.profiles(id) on delete set null;

alter table public.proposals
  drop constraint proposals_author_id_fkey,
  add constraint proposals_author_id_fkey
    foreign key (author_id) references public.profiles(id) on delete set null;

alter table public.proposals
  drop constraint proposals_reviewed_by_fkey,
  add constraint proposals_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(id) on delete set null;

alter table public.proposals
  drop constraint proposals_comment_id_fkey,
  add constraint proposals_comment_id_fkey
    foreign key (comment_id) references public.comments(id) on delete set null;

alter table public.article_versions
  drop constraint fk_from_proposal,
  add constraint fk_from_proposal
    foreign key (from_proposal) references public.proposals(id) on delete set null;

-- ── 2. handle_new_user: full email as username ─────────────────────────────────
-- split_part(email, '@', 1) collides when two providers share a local-part.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── 3. notifications.kind check constraint ─────────────────────────────────────
alter table public.notifications
  add constraint notifications_kind_check
    check (kind in ('new_article', 'new_comment', 'proposal_status', 'role_change'));

-- ── 4. Promote version columns from smallint to integer ────────────────────────
alter table public.articles
  alter column current_version type integer;

alter table public.article_versions
  alter column version_number type integer;

-- ── 5. Replace notifications.read boolean with read_at timestamptz ─────────────
-- NULL = unread. Migrate existing read=true rows to read_at = created_at.

alter table public.notifications
  add column read_at timestamptz;

update public.notifications
  set read_at = created_at
  where read = true;

alter table public.notifications
  drop column read;

drop index if exists notifications_user_id_read_created_at_idx;
create index notifications_unread_idx
  on public.notifications (user_id, (read_at is null), created_at desc);

-- ── 6. proposals_reviewer_update: add WITH CHECK ───────────────────────────────
-- Prevents reviewers from overwriting arbitrary fields via direct API UPDATE.

drop policy "proposals_reviewer_update" on public.proposals;
create policy "proposals_reviewer_update"
  on public.proposals for update
  using  (public.current_user_role() in ('reviewer', 'admin'))
  with check (
    status in ('accepted', 'rejected')
    and reviewed_by = auth.uid()
  );

-- ── 7. Trigger: keep articles.current_version in sync ─────────────────────────
-- Fires after every INSERT on article_versions. GREATEST ensures the pointer
-- never goes backwards if versions are inserted out of order.

create or replace function public.sync_article_current_version()
returns trigger language plpgsql as $$
begin
  update public.articles
  set current_version = greatest(current_version, new.version_number)
  where id = new.article_id;
  return null;
end;
$$;

create trigger article_versions_sync_current_version
  after insert on public.article_versions
  for each row execute function public.sync_article_current_version();

-- ── 8. set_user_role: raise if user not found ──────────────────────────────────

create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void language plpgsql security definer as $$
begin
  if public.current_user_role() != 'admin' then
    raise exception 'permission denied: admin role required';
  end if;

  if p_role not in ('reader', 'reviewer', 'admin') then
    raise exception 'invalid role: %', p_role;
  end if;

  if p_user_id = auth.uid() and p_role != 'admin' then
    raise exception 'admins cannot demote themselves';
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  if not found then
    raise exception 'user % not found', p_user_id;
  end if;
end;
$$;

-- ── 9. get_article_versions: return integer not smallint ───────────────────────
-- CREATE OR REPLACE cannot change return type; drop and recreate.

drop function if exists public.get_article_versions(text);

create function public.get_article_versions(p_slug text)
returns table (
  id             uuid,
  version_number integer,
  content        text,
  change_summary text,
  from_proposal  uuid,
  created_by     uuid,
  created_at     timestamptz
)
language sql security definer stable as $$
  select
    av.id,
    av.version_number,
    av.content,
    av.change_summary,
    av.from_proposal,
    av.created_by,
    av.created_at
  from public.article_versions av
  join public.articles a on a.id = av.article_id
  where a.slug = p_slug
    and (a.published = true or public.current_user_role() in ('reviewer', 'admin'))
  order by av.version_number asc;
$$;

-- ── 10. accept_proposal: local variable integer ────────────────────────────────
-- v_new_version was smallint; must match the column's new integer type.

create or replace function public.accept_proposal(p_proposal_id uuid)
returns public.article_versions
language plpgsql security definer as $$
declare
  v_proposal    public.proposals;
  v_article     public.articles;
  v_new_version integer;
  v_version_row public.article_versions;
begin
  if public.current_user_role() not in ('reviewer', 'admin') then
    raise exception 'permission denied: reviewer or admin role required';
  end if;

  select * into v_proposal
  from public.proposals
  where id = p_proposal_id and status = 'pending'
  for update;

  if not found then
    raise exception 'proposal % not found or already reviewed', p_proposal_id;
  end if;

  select * into v_article
  from public.articles
  where id = v_proposal.article_id
  for update;

  v_new_version := v_article.current_version + 1;

  insert into public.article_versions
    (article_id, version_number, content, change_summary, from_proposal, created_by)
  values (
    v_proposal.article_id,
    v_new_version,
    v_proposal.proposed_text,
    coalesce('Accepted proposal: ' || v_proposal.section_ref, 'Community edit'),
    v_proposal.id,
    auth.uid()
  )
  returning * into v_version_row;

  -- sync_article_current_version trigger fires on the insert above;
  -- this UPDATE is kept to also refresh updated_at on the articles row.
  update public.articles
  set current_version = v_new_version, updated_at = now()
  where id = v_proposal.article_id;

  update public.proposals
  set status = 'accepted', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_proposal_id;

  return v_version_row;
end;
$$;
