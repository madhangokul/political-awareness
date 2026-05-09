# SPEC — Examine It Yourself

> **Agentic input document.**
> This file is the single source of truth. One edit here → ask GitHub Copilot to regenerate
> the affected migrations, types, components, or pgTAP tests.

---

## Entities

Each entity maps to: `public.<entity_plural>` table → `interface Entity` in `types.ts`
→ feature folder `src/features/<entities>/`.

---

### Profile

Extends `auth.users`. Auto-created via trigger on first signup.

| Field          | Type        | Notes                                  |
|----------------|-------------|----------------------------------------|
| `id`           | `uuid`      | FK → `auth.users`, PK                  |
| `username`     | `text?`     | unique, auto-set from email prefix     |
| `display_name` | `text?`     | shown in comments                      |
| `role`         | `Role`      | default `'reader'`                     |
| `avatar_url`   | `text?`     |                                        |
| `created_at`   | `timestamptz` |                                      |
| `updated_at`   | `timestamptz` |                                      |

**Invariants:**
- `role` ∈ `{'reader', 'reviewer', 'admin'}`
- Only admin can change `role` via `set_user_role()`
- A user cannot elevate their own role

---

### Article

Published unit. Content lives in `ArticleVersion`, not here.

| Field             | Type        | Notes                               |
|-------------------|-------------|-------------------------------------|
| `id`              | `uuid`      | PK                                  |
| `slug`            | `text`      | unique, URL-safe, immutable         |
| `title`           | `text`      |                                     |
| `subtitle`        | `text?`     |                                     |
| `current_version` | `smallint`  | default 1, bumped on proposal accept|
| `published`       | `bool`      | false = draft                       |
| `created_by`      | `uuid?`     | FK → profiles                       |
| `created_at`      | `timestamptz` |                                   |
| `updated_at`      | `timestamptz` |                                   |

**Invariants:**
- `slug` is immutable after creation
- `current_version` always has a matching `article_versions` row
- Drafts are visible only to `reviewer` and `admin`

---

### ArticleVersion

Immutable. Each accepted proposal creates a new row.

| Field            | Type        | Notes                                |
|------------------|-------------|--------------------------------------|
| `id`             | `uuid`      | PK                                   |
| `article_id`     | `uuid`      | FK → articles                        |
| `version_number` | `smallint`  | unique per article                   |
| `content`        | `text`      | full article markdown                |
| `change_summary` | `text?`     | human-readable description of change |
| `from_proposal`  | `uuid?`     | FK → proposals (set on accept)       |
| `created_by`     | `uuid?`     | FK → profiles                        |
| `created_at`     | `timestamptz` |                                    |

**Invariants:**
- Never updated after insert
- `version_number` = previous `version_number` + 1 (enforced by `accept_proposal()`)

---

### Comment

Covers three interaction types: discussion, fact contests, edit proposals (informal).

| Field        | Type           | Notes                                     |
|--------------|----------------|-------------------------------------------|
| `id`         | `uuid`         | PK                                        |
| `article_id` | `uuid`         | FK → articles                             |
| `version_id` | `uuid?`        | which version was active when posted      |
| `author_id`  | `uuid?`        | FK → profiles                             |
| `content`    | `text`         |                                           |
| `kind`       | `CommentKind`  | `'comment'` \| `'fact_contest'` \| `'proposal'` |
| `section_tag`| `text?`        | e.g. `'heading-2'`, `'sources'`           |
| `parent_id`  | `uuid?`        | FK → self (1-level replies only)          |
| `status`     | `CommentStatus`| `'open'` \| `'resolved'` \| `'rejected'` |
| `created_at` | `timestamptz`  |                                           |
| `updated_at` | `timestamptz`  |                                           |

---

### Proposal

Structured edit submission. Requires `original_text` + `proposed_text`.
Reviewer/admin accepts or rejects. Accepted = new `ArticleVersion`.

| Field           | Type             | Notes                              |
|-----------------|------------------|------------------------------------|
| `id`            | `uuid`           | PK                                 |
| `article_id`    | `uuid`           | FK → articles                      |
| `comment_id`    | `uuid?`          | FK → comments (linking context)    |
| `author_id`     | `uuid?`          | FK → profiles                      |
| `section_ref`   | `text?`          | which section this replaces        |
| `original_text` | `text?`          | text being replaced                |
| `proposed_text` | `text`           | full proposed content              |
| `status`        | `ProposalStatus` | `'pending'` \| `'accepted'` \| `'rejected'` |
| `reviewed_by`   | `uuid?`          | FK → profiles                      |
| `reviewed_at`   | `timestamptz?`   |                                    |
| `review_note`   | `text?`          | reviewer's comment to author       |
| `created_at`    | `timestamptz`    |                                    |

---

### Notification

In-app notification record, also triggers Web Push.

| Field      | Type               | Notes                               |
|------------|--------------------|-------------------------------------|
| `id`       | `uuid`             | PK                                  |
| `user_id`  | `uuid`             | FK → profiles                       |
| `kind`     | `NotificationKind` | see Notification Events in GROUND   |
| `title`    | `text`             |                                     |
| `body`     | `text?`            |                                     |
| `payload`  | `jsonb?`           | extra data (article slug, etc.)     |
| `read`     | `bool`             | default false                       |
| `created_at` | `timestamptz`    |                                     |

---

### PushSubscription

Web Push API subscription per user+device.

| Field          | Type        | Notes                                |
|----------------|-------------|--------------------------------------|
| `id`           | `uuid`      | PK                                   |
| `user_id`      | `uuid`      | FK → profiles                        |
| `subscription` | `jsonb`     | Web Push subscription object         |
| `created_at`   | `timestamptz` |                                    |

**Invariants:**
- Unique per `(user_id, subscription->>'endpoint')`

---

## Features

---

### F01 — Reader Auth

- Magic link login (email OTP via Supabase Auth)
- Profile auto-created on first login via DB trigger
- Login modal accessible from site header
- Sign out clears session immediately

→ `src/features/auth/AuthProvider.tsx` — context with `session`, `user`, `profile`, `loading`
→ `src/features/auth/LoginModal.tsx` — email form + "check your inbox" state

---

### F02 — Article Feed

- List all published articles
- Show title, subtitle, current version badge, last updated
- Links to individual article view

→ `src/features/articles/ArticleList.tsx`

---

### F03 — Article View

- Render markdown content via `react-markdown` + `remark-gfm`
- Section headings auto-get anchor IDs (`id="heading-2"` etc.)
- Version badge + link to version history
- Comment thread below the article
- Logged-out readers see comments but cannot post

→ `src/features/articles/ArticleView.tsx`

---

### F04 — Comment Thread

- Flat list of top-level comments, each expandable for replies (1 level)
- Three kinds displayed with distinct visual treatment:
  - `comment` — neutral (muted)
  - `fact_contest` — red tint
  - `proposal` — teal tint
- Optional `section_tag` shown as a code chip
- Realtime updates via Supabase Realtime channel
- Requires login to post

→ `src/features/comments/CommentThread.tsx`
→ `src/features/comments/CommentItem.tsx`
→ `src/features/comments/CommentForm.tsx`

---

### F05 — Edit Proposals

- Proposal form with `original_text` + `proposed_text` + optional `section_ref`
- Linked to a comment for context
- Status badge: pending / accepted / rejected
- Accepted proposal triggers `accept_proposal()` DB function → new article version

→ `src/features/proposals/ProposalForm.tsx`

---

### F06 — Version History

- List all versions of an article chronologically
- Each version shows: version number, date, `change_summary`, reviewer who accepted
- Diff between adjacent versions rendered inline
- Diff uses `diff-match-patch`, semantic cleanup, paragraph-level

→ `src/features/articles/VersionHistory.tsx`
→ `src/features/articles/VersionDiff.tsx`

---

### F07 — Admin Panel

Route `/admin` — guarded by `profile.role === 'admin'` client-side + RLS server-side.

Three sections:

1. **Pending Proposals** — list with accept / reject buttons
2. **Role Management** — table of all users, dropdown to set role
3. **Article Editor** — create draft articles (slug + title + markdown content)

Reviewer role sees sections 1 only (pending proposals).

→ `src/features/admin/AdminPanel.tsx`
→ `src/features/admin/ProposalReview.tsx`
→ `src/features/admin/ReviewerManager.tsx`
→ `src/features/admin/ArticleEditor.tsx`

---

### F08 — PWA Notifications

- `manifest.json` + Vite PWA plugin for installability
- Service worker in `public/sw.js` handles `push` events
- `usePushSubscription()` hook subscribes user on login
- `NotificationBell` component: bell icon + unread count badge + dropdown list
- Supabase Edge Function `notify/` sends Web Push + inserts notification rows

→ `src/features/notifications/NotificationBell.tsx`
→ `src/features/notifications/usePushSubscription.ts`
→ `supabase/functions/notify/index.ts`

---

## Roles & Permissions Matrix

| Action                      | reader | reviewer | admin |
|-----------------------------|--------|----------|-------|
| Read published articles     | ✓      | ✓        | ✓     |
| Read draft articles         | ✗      | ✓        | ✓     |
| Post comments               | ✓      | ✓        | ✓     |
| Propose edits               | ✓      | ✓        | ✓     |
| Resolve / reject comments   | ✗      | ✓        | ✓     |
| Accept / reject proposals   | ✗      | ✓        | ✓     |
| Create articles             | ✗      | ✗        | ✓     |
| Publish articles            | ✗      | ✗        | ✓     |
| Manage roles                | ✗      | ✗        | ✓     |

---

## pgTAP Invariants (→ `supabase/tests/`)

1. All 7 tables exist with correct schema
2. RLS is enabled on every table
3. `profiles.role` ∈ valid set
4. `accept_proposal()`, `reject_proposal()`, `set_user_role()`, `get_article_versions()` exist
5. `accept_proposal()` is callable only by reviewer/admin
6. `set_user_role()` is callable only by admin
7. `push_subscriptions` unique per `(user_id, endpoint)`
8. `article_versions` unique per `(article_id, version_number)`

---

## Routes

| Path                          | Component         | Guard           |
|-------------------------------|-------------------|-----------------|
| `/`                           | `ArticleList`     | public          |
| `/articles/:slug`             | `ArticleView`     | public          |
| `/articles/:slug/history`     | `VersionHistory`  | public          |
| `/admin`                      | `AdminPanel`      | admin only      |
