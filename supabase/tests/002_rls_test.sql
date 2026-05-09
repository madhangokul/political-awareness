-- 002_rls_test.sql
-- pgTAP tests for Row-Level Security policies.
-- Verifies policy existence, commands, and data-visibility rules.
-- Run with: supabase db test

begin;

select plan(34);

-- ── 1. Named policies exist (via pg_policies) ────────────────────────────────

-- profiles (3)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_read'),         'profiles_read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_self_update'),  'profiles_self_update policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_admin_update'), 'profiles_admin_update policy exists');

-- articles (4)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='articles' and policyname='articles_published_read'),    'articles_published_read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='articles' and policyname='articles_reviewer_read_all'), 'articles_reviewer_read_all policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='articles' and policyname='articles_admin_insert'),      'articles_admin_insert policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='articles' and policyname='articles_admin_update'),      'articles_admin_update policy exists');

-- article_versions (2)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='article_versions' and policyname='versions_read'),         'versions_read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='article_versions' and policyname='versions_admin_insert'), 'versions_admin_insert policy exists');

-- comments (4)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_read'),             'comments_read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_auth_insert'),      'comments_auth_insert policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_own_update'),       'comments_own_update policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='comments_reviewer_resolve'), 'comments_reviewer_resolve policy exists');

-- proposals (3)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='proposals' and policyname='proposals_read'),            'proposals_read policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='proposals' and policyname='proposals_auth_insert'),     'proposals_auth_insert policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='proposals' and policyname='proposals_reviewer_update'), 'proposals_reviewer_update policy exists');

-- notifications (2)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_own_select'), 'notifications_own_select policy exists');
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='notifications' and policyname='notifications_own_update'), 'notifications_own_update policy exists');

-- push_subscriptions (1)
select ok(exists(select 1 from pg_policies where schemaname='public' and tablename='push_subscriptions' and policyname='push_own_all'), 'push_own_all policy exists');

-- ── 2. Policy commands (via pg_policies) ──────────────────────────────────────
select is(
  (select cmd from pg_policies
   where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_read'),
  'SELECT',
  'profiles_read is a SELECT policy'
);
select is(
  (select cmd from pg_policies
   where schemaname = 'public' and tablename = 'articles' and policyname = 'articles_admin_insert'),
  'INSERT',
  'articles_admin_insert is an INSERT policy'
);
select is(
  (select cmd from pg_policies
   where schemaname = 'public' and tablename = 'article_versions' and policyname = 'versions_admin_insert'),
  'INSERT',
  'versions_admin_insert is an INSERT policy'
);
select is(
  (select cmd from pg_policies
   where schemaname = 'public' and tablename = 'comments' and policyname = 'comments_auth_insert'),
  'INSERT',
  'comments_auth_insert is an INSERT policy'
);
select is(
  (select cmd from pg_policies
   where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_own_select'),
  'SELECT',
  'notifications_own_select is a SELECT policy'
);

-- ── 3. Behavioral tests ────────────────────────────────────────────────────────
-- All test data uses fixed UUIDs to avoid coupling to seed row counts.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, is_sso_user
) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls_reader@test.local', 'x', now(), '{}', '{}', false, now(), now(),
   '', '', '', '', '', false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rls_reviewer@test.local', 'x', now(), '{}', '{}', false, now(), now(),
   '', '', '', '', '', false);

-- handle_new_user trigger creates profiles as 'reader'; elevate the reviewer
update public.profiles
set role = 'reviewer'
where id = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002';

insert into public.articles (id, slug, title, published, created_by) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', 'rls-published',
   'RLS Published Article', true,  'aaaaaaaa-aaaa-aaaa-aaaa-000000000002'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', 'rls-unpublished',
   'RLS Unpublished Article', false, 'aaaaaaaa-aaaa-aaaa-aaaa-000000000002');

insert into public.notifications (id, user_id, kind, title) values
  ('dddddddd-dddd-dddd-dddd-000000000001',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', 'new_article', 'Notification for reader'),
  ('dddddddd-dddd-dddd-dddd-000000000002',
   'aaaaaaaa-aaaa-aaaa-aaaa-000000000002', 'new_article', 'Notification for reviewer');

-- ── anon: published article visible, unpublished hidden ────────────────────────
set local role anon;

select is(
  (select count(*)::int from public.articles
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-000000000001'),
  1,
  'anon can see published article'
);
select is(
  (select count(*)::int from public.articles
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  0,
  'anon cannot see unpublished article'
);

reset role;

-- ── reader: same visibility as anon for articles ───────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-000000000001","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.articles
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  0,
  'reader cannot see unpublished article'
);

-- reader sees only own notification
select is(
  (select count(*)::int from public.notifications
   where id in ('dddddddd-dddd-dddd-dddd-000000000001',
                'dddddddd-dddd-dddd-dddd-000000000002')),
  1,
  'reader sees only own notifications'
);

reset role;

-- ── reviewer: can see all articles including unpublished ───────────────────────
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-000000000002","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.articles
   where id = 'bbbbbbbb-bbbb-bbbb-bbbb-000000000002'),
  1,
  'reviewer can see unpublished article'
);

-- reviewer sees only own notification
select is(
  (select count(*)::int from public.notifications
   where id in ('dddddddd-dddd-dddd-dddd-000000000001',
                'dddddddd-dddd-dddd-dddd-000000000002')),
  1,
  'reviewer sees only own notifications'
);

reset role;

-- ── notifications: no DELETE or user-level INSERT policies ────────────────────
select is(
  (select count(*)
   from pg_policies
   where schemaname = 'public' and tablename = 'notifications' and cmd = 'DELETE'),
  0::bigint,
  'notifications has no DELETE policy'
);

select is(
  (select count(*)
   from pg_policies
   where schemaname = 'public' and tablename = 'notifications' and cmd = 'INSERT'),
  0::bigint,
  'notifications has no user-level INSERT policy'
);
-- ── proposals_reviewer_update: WITH CHECK is present ────────────────────
-- with_check (qual for WITH CHECK) must be non-null
select ok(
  (select with_check is not null
   from pg_policies
   where schemaname = 'public' and tablename = 'proposals'
     and policyname = 'proposals_reviewer_update'),
  'proposals_reviewer_update has a WITH CHECK clause'
);

-- ── notifications.read_at: insert defaults to NULL (unread) ──────────────
reset role;

select is(
  (select read_at from public.notifications
   where id = 'dddddddd-dddd-dddd-dddd-000000000001'),
  null::timestamptz,
  'newly inserted notification has read_at = NULL (unread)'
);
select * from finish();
rollback;
