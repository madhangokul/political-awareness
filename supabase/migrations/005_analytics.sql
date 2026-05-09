-- ─────────────────────────────────────────────────────────────────────────────
-- 005_analytics: user engagement event tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id   text        NOT NULL,
  event_type   text        NOT NULL,   -- 'article_view' | 'scroll_depth' | 'quiz_answer' | 'time_on_page' | 'link_click'
  article_slug text,
  properties   jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_user_id_idx     ON public.events (user_id);
CREATE INDEX IF NOT EXISTS events_article_slug_idx ON public.events (article_slug);
CREATE INDEX IF NOT EXISTS events_created_at_idx   ON public.events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_event_type_idx   ON public.events (event_type);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can log their own events
CREATE POLICY "users can insert own events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins and reviewers can read all events
CREATE POLICY "staff can read all events"
  ON public.events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );
