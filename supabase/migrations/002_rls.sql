-- 002_rls.sql
-- Row-level security policies for all tables.
-- Principle: default deny. Every table needs explicit policies.

-- ── Enable RLS ─────────────────────────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.articles           enable row level security;
alter table public.article_versions   enable row level security;
alter table public.comments           enable row level security;
alter table public.proposals          enable row level security;
alter table public.notifications      enable row level security;
alter table public.push_subscriptions enable row level security;

-- ── Helper: caller's role ──────────────────────────────────────────────────────
-- Used in policies. security definer so it can read profiles even when the
-- calling user doesn't have a direct select policy on profiles yet.
create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'reader'
  );
$$;

-- ── profiles ───────────────────────────────────────────────────────────────────
-- Anyone can read profiles (needed for comment author display names).
create policy "profiles_read"
  on public.profiles for select
  using (true);

-- Users can update their own non-role fields.
create policy "profiles_self_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- role cannot be changed by self: new.role must equal existing role
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Only admins can change any profile (including role).
create policy "profiles_admin_update"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- ── articles ───────────────────────────────────────────────────────────────────
create policy "articles_published_read"
  on public.articles for select
  using (published = true);

create policy "articles_reviewer_read_all"
  on public.articles for select
  using (public.current_user_role() in ('reviewer', 'admin'));

create policy "articles_admin_insert"
  on public.articles for insert
  with check (public.current_user_role() = 'admin');

create policy "articles_admin_update"
  on public.articles for update
  using (public.current_user_role() = 'admin');

-- ── article_versions ───────────────────────────────────────────────────────────
create policy "versions_read"
  on public.article_versions for select
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and (a.published = true or public.current_user_role() in ('reviewer', 'admin'))
    )
  );

create policy "versions_admin_insert"
  on public.article_versions for insert
  with check (public.current_user_role() = 'admin');

-- Versions are never updated — no update/delete policies.

-- ── comments ───────────────────────────────────────────────────────────────────
create policy "comments_read"
  on public.comments for select
  using (true);

create policy "comments_auth_insert"
  on public.comments for insert
  with check (auth.uid() is not null and author_id = auth.uid());

-- Authors can update content of their own open comment.
create policy "comments_own_update"
  on public.comments for update
  using (author_id = auth.uid() and status = 'open')
  with check (author_id = auth.uid());

-- Reviewers/admins can resolve or reject comments.
create policy "comments_reviewer_resolve"
  on public.comments for update
  using (public.current_user_role() in ('reviewer', 'admin'))
  with check (status in ('resolved', 'rejected'));

-- ── proposals ──────────────────────────────────────────────────────────────────
-- Authors see their own; reviewers/admins see all.
create policy "proposals_read"
  on public.proposals for select
  using (
    author_id = auth.uid()
    or public.current_user_role() in ('reviewer', 'admin')
  );

create policy "proposals_auth_insert"
  on public.proposals for insert
  with check (auth.uid() is not null and author_id = auth.uid());

-- Only reviewers/admins can update (accept/reject).
create policy "proposals_reviewer_update"
  on public.proposals for update
  using (public.current_user_role() in ('reviewer', 'admin'));

-- ── notifications ──────────────────────────────────────────────────────────────
-- Users see only their own notifications.
create policy "notifications_own_select"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "notifications_own_update"
  on public.notifications for update
  using (user_id = auth.uid());

-- Inserts come from service role (edge functions). No user-level insert policy.

-- ── push_subscriptions ─────────────────────────────────────────────────────────
create policy "push_own_all"
  on public.push_subscriptions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
