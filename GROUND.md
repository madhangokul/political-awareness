# GROUND — Examine It Yourself: Political Awareness Platform

> Architecture, design, and decision record. Read this before touching any code.

---

## Vision

A journalistic platform where political articles are not endpoints but *conversations*.
Readers log in, tag specific points, contest facts, propose edits — and watch articles
evolve transparently. Like Wikipedia with editorial control and a git-like audit trail.

---

## Design System

Inherited from existing HTML articles. **Do not deviate.**

### Color Tokens

| Token       | Value       | Use                              |
|-------------|-------------|----------------------------------|
| `--ink`     | `#1a1208`   | Primary text, borders            |
| `--paper`   | `#faf6ee`   | Base background                  |
| `--paper2`  | `#f3ede0`   | Subtle sections                  |
| `--paper3`  | `#ebe3d0`   | Cards, comment boxes             |
| `--dust`    | `#d4c9b0`   | Dividers                         |
| `--dust2`   | `#b8aa90`   | Secondary borders                |
| `--muted`   | `#8a7d68`   | Labels, meta text                |
| `--accent`  | `#8b3a00`   | Links, CTAs (burnt sienna)       |
| `--gold`    | `#a07030`   | Highlights, badges               |
| `--teal`    | `#1a5848`   | Verified, resolved, accepted     |
| `--red`     | `#8b2020`   | Contested, warnings, rejected    |
| `--blue`    | `#1a3868`   | Informational                    |

### Typography

| Family           | Usage                              |
|------------------|------------------------------------|
| `Playfair Display` | Headings, masthead               |
| `Literata`       | Body text, article content         |
| `Space Mono`     | Labels, version numbers, metadata  |

### Aesthetic Rules

- Aged paper grain texture (`body::before` SVG noise filter)
- Max article width: `820px` centered
- Generous whitespace — padding over density
- Borders over shadows
- Minimal border-radius (`2px` max)
- No animations beyond `opacity` transitions

---

## Architecture

### Lean Principle

> If a feature can live in Supabase (RLS, DB function, realtime, edge function), it should.
> React handles display only. No business logic in React components.

### Stack

| Layer         | Choice                              | Why                                    |
|---------------|-------------------------------------|----------------------------------------|
| Frontend      | React 18 + Vite + TypeScript        | Fast DX, SPA is fine                   |
| Styling       | Tailwind CSS v3 + CSS variables     | Design token bridge                    |
| Data          | TanStack Query v5                   | Cache + loading states, no boilerplate |
| Routing       | React Router v6                     | Simple SPA routes                      |
| Backend       | Supabase (Postgres + Auth + RT)     | Auth, DB, RLS, Realtime in one         |
| Notifications | Supabase Edge Functions + Web Push  | PWA push via VAPID                     |
| Diffing       | `diff-match-patch`                  | Client-side version diff               |

### Non-choices (intentionally excluded)

- No Redux / Zustand — React Query + Supabase context is enough
- No Next.js — no SSR requirement yet; SPA is simpler to host
- No separate API layer — Supabase client is the API
- No ORM — raw SQL migrations for transparency and pgTAP compatibility

---

## Folder Structure

```
political-awareness/
├── GROUND.md                    ← this file (architecture decisions)
├── SPEC.md                      ← agentic input: source of truth for features
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_schema.sql       ← tables, indexes, triggers, auto-profile
│   │   ├── 002_rls.sql          ← row-level security policies
│   │   └── 003_functions.sql    ← DB functions (accept_proposal, set_role…)
│   ├── functions/
│   │   └── notify/index.ts      ← Edge function for push notifications
│   └── tests/
│       └── 001_schema_test.sql  ← pgTAP tests
└── app/                         ← React app
    ├── public/
    │   └── sw.js                ← push notification service worker
    ├── src/
    │   ├── lib/
    │   │   ├── supabase.ts      ← typed Supabase client
    │   │   ├── types.ts         ← DB types (regenerated from schema)
    │   │   └── utils.ts
    │   ├── features/
    │   │   ├── auth/            ← AuthProvider, LoginModal
    │   │   ├── articles/        ← ArticleList, ArticleView, VersionHistory, VersionDiff
    │   │   ├── comments/        ← CommentThread, CommentItem, CommentForm
    │   │   ├── proposals/       ← ProposalForm
    │   │   ├── admin/           ← AdminPanel, ProposalReview, ReviewerManager, ArticleEditor
    │   │   └── notifications/   ← NotificationBell, usePushSubscription
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   └── Header.tsx
    │   ├── App.tsx              ← routes
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## Roles

| Role       | Permissions                                               |
|------------|-----------------------------------------------------------|
| `reader`   | View published articles, post comments, propose edits    |
| `reviewer` | + resolve comments, accept/reject proposals              |
| `admin`    | + publish articles, create articles, manage all roles    |

Role is stored on `profiles.role` and enforced by Postgres RLS. Never trust the client.

---

## Article Versioning Model

- Content lives in `article_versions`, not `articles`
- `articles.current_version` points to the active version number
- Every accepted proposal creates a new `article_versions` row
- Diffs are computed **client-side** using `diff-match-patch` between adjacent versions
- Versions are immutable — never updated after insert
- The diff view shows semantic (paragraph-level) changes only

---

## Agentic Coding Path

> One input document → entire codebase

`SPEC.md` is the source of truth. When features or entities change, update `SPEC.md` first,
then tell GitHub Copilot: *"Read SPEC.md and regenerate [migrations / types / components]"*.

```
SPEC.md
  ├─→ supabase/migrations/    (SQL schema + RLS from entity + permission specs)
  ├─→ src/lib/types.ts        (TypeScript interfaces from table definitions)
  ├─→ src/features/**         (React components from feature specs)
  └─→ supabase/tests/         (pgTAP assertions from entity invariants)
```

**Naming convention** (SPEC → code mapping):
- Entity `Foo` → table `public.foos` → interface `Foo` → `src/features/foos/`
- Feature `F0N` → React component(s) + Supabase function if needed
- Invariant → one `pgTAP` assertion

---

## PWA Notification Events

| Event             | Trigger                        | Target                     |
|-------------------|--------------------------------|----------------------------|
| `new_article`     | `article.published` set true   | All subscribed users       |
| `new_comment`     | Comment inserted               | Article author + reviewers |
| `proposal_status` | Proposal accepted/rejected     | Proposal author            |
| `role_change`     | `profile.role` changed         | Affected user              |

---

## Local Dev Setup

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Start local Supabase
cd supabase && supabase start

# 3. Run migrations
supabase db reset

# 4. Run pgTAP tests
supabase db test

# 5. Start the app
cd app && pnpm install && pnpm dev
```

Copy `app/.env.example` → `app/.env.local` and fill in your local Supabase keys.
