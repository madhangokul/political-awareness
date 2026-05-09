-- 003_functions.sql
-- Business logic as DB functions: accept_proposal, reject_proposal,
-- set_user_role, get_article_versions.
-- All security definer so RLS doesn't block internal operations.

-- ── accept_proposal ────────────────────────────────────────────────────────────
-- Accepts a pending proposal:
--   1. Creates a new article_versions row
--   2. Bumps articles.current_version
--   3. Marks proposal accepted
-- Returns the new article_version row.
create or replace function public.accept_proposal(p_proposal_id uuid)
returns public.article_versions
language plpgsql security definer as $$
declare
  v_proposal    public.proposals;
  v_article     public.articles;
  v_new_version smallint;
  v_version_row public.article_versions;
begin
  -- Permission check (even though security definer, enforce at app level)
  if public.current_user_role() not in ('reviewer', 'admin') then
    raise exception 'permission denied: reviewer or admin role required';
  end if;

  -- Load and lock proposal
  select * into v_proposal
  from public.proposals
  where id = p_proposal_id and status = 'pending'
  for update;

  if not found then
    raise exception 'proposal % not found or already reviewed', p_proposal_id;
  end if;

  -- Load article
  select * into v_article
  from public.articles
  where id = v_proposal.article_id
  for update;

  v_new_version := v_article.current_version + 1;

  -- Insert new version
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

  -- Bump article version pointer
  update public.articles
  set current_version = v_new_version, updated_at = now()
  where id = v_proposal.article_id;

  -- Mark proposal accepted
  update public.proposals
  set status = 'accepted', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_proposal_id;

  return v_version_row;
end;
$$;

-- ── reject_proposal ────────────────────────────────────────────────────────────
create or replace function public.reject_proposal(
  p_proposal_id uuid,
  p_note        text default null
)
returns void language plpgsql security definer as $$
begin
  if public.current_user_role() not in ('reviewer', 'admin') then
    raise exception 'permission denied: reviewer or admin role required';
  end if;

  update public.proposals
  set
    status      = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_note = p_note
  where id = p_proposal_id and status = 'pending';

  if not found then
    raise exception 'proposal % not found or already reviewed', p_proposal_id;
  end if;
end;
$$;

-- ── set_user_role ──────────────────────────────────────────────────────────────
create or replace function public.set_user_role(p_user_id uuid, p_role text)
returns void language plpgsql security definer as $$
begin
  if public.current_user_role() != 'admin' then
    raise exception 'permission denied: admin role required';
  end if;

  if p_role not in ('reader', 'reviewer', 'admin') then
    raise exception 'invalid role: %', p_role;
  end if;

  -- Prevent self-demotion (safety)
  if p_user_id = auth.uid() and p_role != 'admin' then
    raise exception 'admins cannot demote themselves';
  end if;

  update public.profiles set role = p_role where id = p_user_id;
end;
$$;

-- ── get_article_versions ───────────────────────────────────────────────────────
-- Returns all versions for an article slug, ordered oldest → newest.
-- Used by VersionHistory page to render diffs.
create or replace function public.get_article_versions(p_slug text)
returns table (
  id             uuid,
  version_number smallint,
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
