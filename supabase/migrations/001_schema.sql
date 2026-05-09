-- 001_schema.sql
-- Tables, indexes, triggers, auto-profile creation
-- Generated from SPEC.md entities. Regenerate with: ask GitHub Copilot to read SPEC.md

-- ── Extensions ─────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── profiles ───────────────────────────────────────────────────────────────────
-- Extends auth.users. Auto-created on signup via handle_new_user trigger.
create table public.profiles (
  id           uuid        references auth.users on delete cascade primary key,
  username     text        unique,
  display_name text,
  role         text        not null default 'reader'
               check (role in ('reader', 'reviewer', 'admin')),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── articles ───────────────────────────────────────────────────────────────────
create table public.articles (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        unique not null,
  title           text        not null,
  subtitle        text,
  current_version smallint    not null default 1,
  published       boolean     not null default false,
  created_by      uuid        references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── article_versions ───────────────────────────────────────────────────────────
-- Immutable. One row per accepted state of an article.
create table public.article_versions (
  id              uuid        primary key default gen_random_uuid(),
  article_id      uuid        not null references public.articles(id) on delete cascade,
  version_number  smallint    not null,
  content         text        not null,      -- full article markdown
  change_summary  text,
  from_proposal   uuid,                      -- FK added after proposals table (below)
  created_by      uuid        references public.profiles(id),
  created_at      timestamptz not null default now(),
  unique (article_id, version_number)
);

-- ── comments ───────────────────────────────────────────────────────────────────
-- Covers: discussion, fact contests, informal proposals
create table public.comments (
  id           uuid        primary key default gen_random_uuid(),
  article_id   uuid        not null references public.articles(id) on delete cascade,
  version_id   uuid        references public.article_versions(id),
  author_id    uuid        references public.profiles(id),
  content      text        not null,
  kind         text        not null default 'comment'
               check (kind in ('comment', 'fact_contest', 'proposal')),
  section_tag  text,                         -- e.g. 'heading-2', 'sources'
  parent_id    uuid        references public.comments(id),
  status       text        not null default 'open'
               check (status in ('open', 'resolved', 'rejected')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── proposals ──────────────────────────────────────────────────────────────────
-- Structured edit proposals. Accepted = new article version.
create table public.proposals (
  id             uuid        primary key default gen_random_uuid(),
  article_id     uuid        not null references public.articles(id) on delete cascade,
  comment_id     uuid        references public.comments(id),
  author_id      uuid        references public.profiles(id),
  section_ref    text,
  original_text  text,
  proposed_text  text        not null,
  status         text        not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected')),
  reviewed_by    uuid        references public.profiles(id),
  reviewed_at    timestamptz,
  review_note    text,
  created_at     timestamptz not null default now()
);

-- Close the circular FK: article_versions → proposals
alter table public.article_versions
  add constraint fk_from_proposal
  foreign key (from_proposal) references public.proposals(id);

-- ── notifications ──────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  kind       text        not null,   -- 'new_article' | 'new_comment' | 'proposal_status' | 'role_change'
  title      text        not null,
  body       text,
  payload    jsonb,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ── push_subscriptions ─────────────────────────────────────────────────────────
create table public.push_subscriptions (
  id           uuid  primary key default gen_random_uuid(),
  user_id      uuid  not null references public.profiles(id) on delete cascade,
  subscription jsonb not null,                -- Web Push API PushSubscription JSON
  created_at   timestamptz not null default now()
);

-- Expression-based unique index (inline unique constraint can't use JSONB operators)
create unique index push_subscriptions_user_endpoint_idx
  on public.push_subscriptions (user_id, (subscription->>'endpoint'));

-- ── Indexes ────────────────────────────────────────────────────────────────────
create index on public.articles          (published, updated_at desc);
create index on public.article_versions  (article_id, version_number);
create index on public.comments          (article_id, created_at desc);
create index on public.comments          (parent_id);
create index on public.proposals         (article_id, status);
create index on public.notifications     (user_id, read, created_at desc);

-- ── Auto-update updated_at ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.touch_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.touch_updated_at();

-- ── Auto-create profile on signup ──────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
