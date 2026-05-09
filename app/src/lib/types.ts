// src/lib/types.ts
// DB types derived from SPEC.md entities.
// After running `supabase gen types typescript --local`, replace this file
// with the generated output (it will include the same interfaces).

export type Role = 'reader' | 'reviewer' | 'admin'
export type CommentKind = 'comment' | 'fact_contest' | 'proposal'
export type CommentStatus = 'open' | 'resolved' | 'rejected'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected'
export type NotificationKind = 'new_article' | 'new_comment' | 'proposal_status' | 'role_change'

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string | null
  current_version: number
  published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ArticleVersion {
  id: string
  article_id: string
  version_number: number
  content: string
  change_summary: string | null
  from_proposal: string | null
  created_by: string | null
  created_at: string
}

export interface Comment {
  id: string
  article_id: string
  version_id: string | null
  author_id: string | null
  content: string
  kind: CommentKind
  section_tag: string | null
  parent_id: string | null
  status: CommentStatus
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  article_id: string
  comment_id: string | null
  author_id: string | null
  section_ref: string | null
  original_text: string | null
  proposed_text: string
  status: ProposalStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
}

/** In-app notification row. Named AppNotification to avoid clash with DOM Notification. */
export interface AppNotification {
  id: string
  user_id: string
  kind: NotificationKind
  title: string
  body: string | null
  payload: Record<string, unknown> | null
  read: boolean
  created_at: string
}

/** DB push_subscriptions row. Named DbPushSubscription to avoid clash with DOM PushSubscription. */
export interface DbPushSubscription {
  id: string
  user_id: string
  subscription: PushSubscriptionJSON
  created_at: string
}

// ── Joined types for UI ───────────────────────────────────────────────────────

export interface CommentWithAuthor extends Comment {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'role'> | null
  replies?: CommentWithAuthor[]
}

export interface ProposalWithDetails extends Proposal {
  author: Pick<Profile, 'id' | 'username' | 'display_name'> | null
  reviewer: Pick<Profile, 'id' | 'username' | 'display_name'> | null
  article: Pick<Article, 'id' | 'slug' | 'title'> | null
}

// ── Supabase Database type (for typed client) ─────────────────────────────────
// Matches the structure that @supabase/supabase-js v2 expects.
// After running `supabase gen types typescript --local`, replace this entire
// section with the generated output.

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: { id: string; username?: string | null; display_name?: string | null; role?: Role; avatar_url?: string | null }
        Update: { username?: string | null; display_name?: string | null; role?: Role; avatar_url?: string | null }
        Relationships: Rel[]
      }
      articles: {
        Row: Article
        Insert: { slug: string; title: string; subtitle?: string | null; current_version?: number; published?: boolean; created_by?: string | null }
        Update: { slug?: string; title?: string; subtitle?: string | null; current_version?: number; published?: boolean; updated_at?: string }
        Relationships: Rel[]
      }
      article_versions: {
        Row: ArticleVersion
        Insert: { article_id: string; version_number: number; content: string; change_summary?: string | null; from_proposal?: string | null; created_by?: string | null }
        Update: Record<string, never>
        Relationships: Rel[]
      }
      comments: {
        Row: Comment
        Insert: { article_id: string; version_id?: string | null; author_id?: string | null; content: string; kind?: CommentKind; section_tag?: string | null; parent_id?: string | null }
        Update: { content?: string; status?: CommentStatus }
        Relationships: Rel[]
      }
      proposals: {
        Row: Proposal
        Insert: { article_id: string; comment_id?: string | null; author_id?: string | null; section_ref?: string | null; original_text?: string | null; proposed_text: string; review_note?: string | null }
        Update: { status?: ProposalStatus; reviewed_by?: string | null; reviewed_at?: string | null; review_note?: string | null }
        Relationships: Rel[]
      }
      notifications: {
        Row: AppNotification
        Insert: { user_id: string; kind: NotificationKind; title: string; body?: string | null; payload?: Record<string, unknown> | null }
        Update: { read?: boolean }
        Relationships: Rel[]
      }
      push_subscriptions: {
        Row: DbPushSubscription
        Insert: { user_id: string; subscription: object }
        Update: Record<string, never>
        Relationships: Rel[]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      accept_proposal: { Args: { p_proposal_id: string }; Returns: ArticleVersion }
      reject_proposal: { Args: { p_proposal_id: string; p_note?: string }; Returns: undefined }
      set_user_role: { Args: { p_user_id: string; p_role: Role }; Returns: undefined }
      get_article_versions: { Args: { p_slug: string }; Returns: ArticleVersion[] }
      current_user_role: { Args: Record<string, never>; Returns: Role }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
