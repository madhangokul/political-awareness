-- 001_schema_test.sql
-- pgTAP structural tests: tables, columns, constraints, triggers, functions.
-- Run with: supabase db test

begin;

select plan(57);

-- ── 1. Tables exist ────────────────────────────────────────────────────────────
select has_table('public', 'profiles',           'profiles table exists');
select has_table('public', 'articles',           'articles table exists');
select has_table('public', 'article_versions',   'article_versions table exists');
select has_table('public', 'comments',           'comments table exists');
select has_table('public', 'proposals',          'proposals table exists');
select has_table('public', 'notifications',      'notifications table exists');
select has_table('public', 'push_subscriptions', 'push_subscriptions table exists');

-- ── 2. RLS enabled ─────────────────────────────────────────────────────────────
-- row_security_active() returns false for superusers; check pg_class.relrowsecurity instead
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),           'profiles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.articles'::regclass),           'articles has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.article_versions'::regclass),   'article_versions has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.comments'::regclass),           'comments has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.proposals'::regclass),          'proposals has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.notifications'::regclass),      'notifications has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.push_subscriptions'::regclass), 'push_subscriptions has RLS enabled');

-- ── 3. Key columns exist ───────────────────────────────────────────────────────
select has_column('public', 'profiles',         'role',            'profiles.role exists');
select has_column('public', 'articles',         'current_version', 'articles.current_version exists');
select has_column('public', 'article_versions', 'version_number',  'article_versions.version_number exists');
select has_column('public', 'article_versions', 'content',         'article_versions.content exists');
select has_column('public', 'comments',         'kind',            'comments.kind exists');
select has_column('public', 'proposals',        'proposed_text',   'proposals.proposed_text exists');

-- ── 4. NOT NULL constraints on critical columns ────────────────────────────────
select col_not_null('public', 'articles',         'slug',           'articles.slug is NOT NULL');
select col_not_null('public', 'articles',         'title',          'articles.title is NOT NULL');
select col_not_null('public', 'profiles',         'role',           'profiles.role is NOT NULL');
select col_not_null('public', 'article_versions', 'article_id',     'article_versions.article_id is NOT NULL');
select col_not_null('public', 'article_versions', 'version_number', 'article_versions.version_number is NOT NULL');

-- ── 5. Check constraints ───────────────────────────────────────────────────────
select col_has_check('public', 'profiles',      'role',   'profiles.role has check constraint');
select col_has_check('public', 'comments',      'kind',   'comments.kind has check constraint');
select col_has_check('public', 'comments',      'status', 'comments.status has check constraint');
select col_has_check('public', 'proposals',     'status', 'proposals.status has check constraint');
select col_has_check('public', 'notifications', 'kind',   'notifications.kind has check constraint');

-- ── 6. Unique constraints ──────────────────────────────────────────────────────
select col_is_unique('public', 'articles', 'slug',     'articles.slug is unique');
select col_is_unique('public', 'profiles', 'username', 'profiles.username is unique');
select is(
  (select count(*)
   from pg_constraint
   where conrelid = 'public.article_versions'::regclass
     and contype = 'u'),
  1::bigint,
  'article_versions has composite unique constraint on (article_id, version_number)'
);

-- ── 7. Functions exist ─────────────────────────────────────────────────────────
select has_function('public', 'accept_proposal',      array['uuid'],        'accept_proposal(uuid) exists');
select has_function('public', 'reject_proposal',      array['uuid', 'text'],'reject_proposal(uuid, text) exists');
select has_function('public', 'set_user_role',        array['uuid', 'text'],'set_user_role(uuid, text) exists');
select has_function('public', 'get_article_versions', array['text'],        'get_article_versions(text) exists');
select has_function('public', 'current_user_role',    array[]::text[],      'current_user_role() exists');
select ok(
  exists(select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'touch_updated_at'),
  'touch_updated_at() exists'
);
select ok(
  exists(select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'handle_new_user'),
  'handle_new_user() exists'
);

-- ── 8. Triggers exist ─────────────────────────────────────────────────────────
select has_trigger('public', 'profiles',         'profiles_updated_at',                    'profiles_updated_at trigger exists');
select has_trigger('public', 'articles',         'articles_updated_at',                    'articles_updated_at trigger exists');
select has_trigger('public', 'comments',         'comments_updated_at',                    'comments_updated_at trigger exists');
select has_trigger('auth',   'users',            'on_auth_user_created',                   'on_auth_user_created trigger exists');
select has_trigger('public', 'article_versions', 'article_versions_sync_current_version',  'article_versions_sync_current_version trigger exists');

-- ── 9. article_versions immutability ──────────────────────────────────────────
select is(
  (select count(*) from pg_policies
   where schemaname = 'public' and tablename = 'article_versions' and cmd = 'UPDATE'),
  0::bigint,
  'article_versions has no UPDATE policy (immutable)'
);

-- ── 10. Column types promoted (smallint → integer) ────────────────────────────
select col_type_is('public', 'articles',         'current_version', 'integer', 'articles.current_version is integer');
select col_type_is('public', 'article_versions', 'version_number',  'integer', 'article_versions.version_number is integer');

-- ── 11. notifications.read_at column replaces read boolean ───────────────────
select has_column('public',    'notifications', 'read_at', 'notifications.read_at column exists');
select hasnt_column('public',  'notifications', 'read',    'notifications.read boolean is gone');
select col_is_null('public',   'notifications', 'read_at', 'notifications.read_at is nullable (NULL = unread)');

-- ── 12. FK on-delete behaviour ────────────────────────────────────────────────
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.articles'::regclass and conname = 'articles_created_by_fkey'),
  'articles.created_by FK is ON DELETE SET NULL'
);
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.article_versions'::regclass and conname = 'article_versions_created_by_fkey'),
  'article_versions.created_by FK is ON DELETE SET NULL'
);
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.comments'::regclass and conname = 'comments_author_id_fkey'),
  'comments.author_id FK is ON DELETE SET NULL'
);
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.proposals'::regclass and conname = 'proposals_author_id_fkey'),
  'proposals.author_id FK is ON DELETE SET NULL'
);
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.proposals'::regclass and conname = 'proposals_comment_id_fkey'),
  'proposals.comment_id FK is ON DELETE SET NULL'
);
select ok(
  (select confdeltype = 'n'
   from pg_constraint
   where conrelid = 'public.article_versions'::regclass and conname = 'fk_from_proposal'),
  'article_versions.from_proposal FK is ON DELETE SET NULL'
);

select * from finish();
rollback;
