-- 003_functions_test.sql
-- pgTAP tests for business-logic functions:
--   current_user_role, accept_proposal, reject_proposal,
--   set_user_role, get_article_versions.
-- Run with: supabase db test

begin;

select plan(23);

-- ── Setup ─────────────────────────────────────────────────────────────────────
-- Fixed UUIDs; distinct from seed data and 002_rls_test.sql test data.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, is_sso_user
) values
  ('ffffffff-ffff-ffff-ffff-000000000001',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'fn_reader@test.local', 'x', now(), '{}', '{}', false, now(), now(),
   '', '', '', '', '', false),
  ('ffffffff-ffff-ffff-ffff-000000000002',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'fn_reviewer@test.local', 'x', now(), '{}', '{}', false, now(), now(),
   '', '', '', '', '', false),
  ('ffffffff-ffff-ffff-ffff-000000000003',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'fn_admin@test.local', 'x', now(), '{}', '{}', false, now(), now(),
   '', '', '', '', '', false);

-- handle_new_user auto-creates profiles as 'reader'; elevate reviewer and admin
update public.profiles set role = 'reviewer' where id = 'ffffffff-ffff-ffff-ffff-000000000002';
update public.profiles set role = 'admin'    where id = 'ffffffff-ffff-ffff-ffff-000000000003';

-- Test article with version 1 already present (simulates real state)
insert into public.articles (id, slug, title, published, created_by)
values ('eeeeeeee-eeee-eeee-eeee-000000000001',
        'fn-test-article', 'FN Test Article', true,
        'ffffffff-ffff-ffff-ffff-000000000003');

insert into public.article_versions (article_id, version_number, content, created_by)
values ('eeeeeeee-eeee-eeee-eeee-000000000001', 1,
        'Initial content v1', 'ffffffff-ffff-ffff-ffff-000000000003');

-- ── current_user_role ─────────────────────────────────────────────────────────

-- No sub in claims → auth.uid() returns NULL → coalesce to 'reader'
select set_config('request.jwt.claims', '{}', true);
select is(
  public.current_user_role(),
  'reader',
  'current_user_role returns reader when no auth.uid()'
);

select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000001","role":"authenticated"}', true);
select is(
  public.current_user_role(),
  'reader',
  'current_user_role returns reader for reader profile'
);

select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000002","role":"authenticated"}', true);
select is(
  public.current_user_role(),
  'reviewer',
  'current_user_role returns reviewer for reviewer profile'
);

select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000003","role":"authenticated"}', true);
select is(
  public.current_user_role(),
  'admin',
  'current_user_role returns admin for admin profile'
);

-- ── accept_proposal ───────────────────────────────────────────────────────────

-- Reader cannot accept
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000001","role":"authenticated"}', true);
select throws_ok(
  $$ select accept_proposal('00000000-0000-0000-0000-000000000000') $$,
  'permission denied: reviewer or admin role required',
  'accept_proposal raises permission error for reader'
);

-- Insert a pending proposal
insert into public.proposals (id, article_id, author_id, proposed_text, status)
values ('cccccccc-cccc-cccc-cccc-000000000001',
        'eeeeeeee-eeee-eeee-eeee-000000000001',
        'ffffffff-ffff-ffff-ffff-000000000001',
        'Updated content v2', 'pending');

-- Reviewer accepts; returned row has version_number = 2
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000002","role":"authenticated"}', true);

select ok(
  (select (accept_proposal('cccccccc-cccc-cccc-cccc-000000000001')).version_number = 2),
  'accept_proposal returns new article_version with version_number = 2'
);
select is(
  (select current_version
   from public.articles where id = 'eeeeeeee-eeee-eeee-eeee-000000000001'),
  2::integer,
  'accept_proposal bumps articles.current_version to 2'
);
select is(
  (select status from public.proposals where id = 'cccccccc-cccc-cccc-cccc-000000000001'),
  'accepted',
  'accept_proposal marks proposal as accepted'
);
select is(
  (select count(*)::int from public.article_versions
   where article_id = 'eeeeeeee-eeee-eeee-eeee-000000000001'),
  2,
  'accept_proposal inserts a new article_versions row'
);

-- Calling accept_proposal again on an already-accepted proposal raises
select throws_ok(
  $$ select accept_proposal('cccccccc-cccc-cccc-cccc-000000000001') $$,
  'proposal cccccccc-cccc-cccc-cccc-000000000001 not found or already reviewed',
  'accept_proposal raises for an already-accepted proposal'
);

-- ── reject_proposal ───────────────────────────────────────────────────────────

-- Reader cannot reject
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000001","role":"authenticated"}', true);
select throws_ok(
  $$ select reject_proposal('00000000-0000-0000-0000-000000000000', null) $$,
  'permission denied: reviewer or admin role required',
  'reject_proposal raises permission error for reader'
);

-- Insert a pending proposal to reject
insert into public.proposals (id, article_id, author_id, proposed_text, status)
values ('cccccccc-cccc-cccc-cccc-000000000002',
        'eeeeeeee-eeee-eeee-eeee-000000000001',
        'ffffffff-ffff-ffff-ffff-000000000001',
        'This will be rejected', 'pending');

select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000002","role":"authenticated"}', true);
select lives_ok(
  $$ select reject_proposal('cccccccc-cccc-cccc-cccc-000000000002', 'Inaccurate') $$,
  'reject_proposal succeeds for reviewer'
);
select is(
  (select status from public.proposals where id = 'cccccccc-cccc-cccc-cccc-000000000002'),
  'rejected',
  'reject_proposal marks proposal as rejected'
);
select is(
  (select review_note from public.proposals where id = 'cccccccc-cccc-cccc-cccc-000000000002'),
  'Inaccurate',
  'reject_proposal stores the review_note'
);

-- ── set_user_role ─────────────────────────────────────────────────────────────

-- Reader cannot change roles
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000001","role":"authenticated"}', true);
select throws_ok(
  $$ select set_user_role('ffffffff-ffff-ffff-ffff-000000000001'::uuid, 'reviewer') $$,
  'permission denied: admin role required',
  'set_user_role raises permission error for reader'
);

-- Admin: invalid role value raises
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000003","role":"authenticated"}', true);
select throws_ok(
  $$ select set_user_role('ffffffff-ffff-ffff-ffff-000000000001'::uuid, 'superuser') $$,
  'invalid role: superuser',
  'set_user_role raises for invalid role value'
);

-- Admin cannot demote self
select throws_ok(
  $$ select set_user_role('ffffffff-ffff-ffff-ffff-000000000003'::uuid, 'reader') $$,
  'admins cannot demote themselves',
  'set_user_role raises when admin tries to demote self'
);

-- Admin can promote reader to reviewer
select lives_ok(
  $$ select set_user_role('ffffffff-ffff-ffff-ffff-000000000001'::uuid, 'reviewer') $$,
  'set_user_role succeeds for admin'
);
select is(
  (select role from public.profiles where id = 'ffffffff-ffff-ffff-ffff-000000000001'),
  'reviewer',
  'set_user_role correctly updates profile role'
);

-- set_user_role raises for a non-existent user UUID
select throws_ok(
  $$ select set_user_role('00000000-0000-0000-0000-000000000099'::uuid, 'reviewer') $$,
  'user 00000000-0000-0000-0000-000000000099 not found',
  'set_user_role raises when user does not exist'
);

-- ── sync_article_current_version trigger ───────────────────────────────────
-- Insert version 3 directly (bypassing accept_proposal) and verify the
-- trigger bumps current_version without any manual UPDATE.

insert into public.article_versions (article_id, version_number, content, created_by)
values ('eeeeeeee-eeee-eeee-eeee-000000000001', 3, 'Direct v3 insert', null);

select is(
  (select current_version from public.articles
   where id = 'eeeeeeee-eeee-eeee-eeee-000000000001'),
  3::integer,
  'sync trigger bumps current_version to 3 on direct article_versions insert'
);

-- ── get_article_versions ────────────────────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"ffffffff-ffff-ffff-ffff-000000000002","role":"authenticated"}', true);

-- 3 versions now exist: v1 from setup + v2 from accept_proposal + v3 direct insert
select is(
  (select count(*)::int from public.get_article_versions('fn-test-article')),
  3,
  'get_article_versions returns all 3 versions for fn-test-article'
);

-- Non-existent slug returns no rows
select is(
  (select count(*)::int from public.get_article_versions('nonexistent-slug')),
  0,
  'get_article_versions returns empty for nonexistent slug'
);

select * from finish();
rollback;
