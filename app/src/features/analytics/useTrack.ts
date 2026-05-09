import { useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'

// Stable session ID per browser tab
const SESSION_ID = crypto.randomUUID()

export type EventType =
  | 'article_view'
  | 'scroll_depth'
  | 'quiz_answer'
  | 'time_on_page'
  | 'link_click'

export function useTrack(articleSlug?: string) {
  const { user } = useAuth()
  // Track which scroll depths have already fired this session
  const firedDepths = useRef<Set<number>>(new Set())

  const track = useCallback(
    (eventType: EventType, properties: Record<string, unknown> = {}) => {
      if (!user) return
      // Fire-and-forget — don't await or surface errors to the user
      supabase.from('events').insert({
        user_id: user.id,
        session_id: SESSION_ID,
        event_type: eventType,
        article_slug: articleSlug ?? null,
        properties,
      }).then()
    },
    [user, articleSlug],
  )

  // Attach an IntersectionObserver-based scroll depth tracker to a container element
  const attachScrollTracker = useCallback(
    (container: HTMLElement | null) => {
      if (!container || !user) return

      firedDepths.current.clear()
      const thresholds = [25, 50, 75, 100]

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const pct = Math.round(entry.intersectionRatio * 100)
            for (const t of thresholds) {
              if (pct >= t && !firedDepths.current.has(t)) {
                firedDepths.current.add(t)
                track('scroll_depth', { percent: t })
              }
            }
          }
        },
        { threshold: thresholds.map((t) => t / 100) },
      )

      observer.observe(container)
      return () => observer.disconnect()
    },
    [user, track],
  )

  return { track, attachScrollTracker }
}
