import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

interface Event {
  id: string
  event_type: string
  article_slug: string | null
  properties: Record<string, unknown>
  created_at: string
  session_id: string
}

interface Props {
  userId: string
  username: string | null
  onClose: () => void
}

const EVENT_ICONS: Record<string, string> = {
  article_view:  '📖',
  scroll_depth:  '📜',
  quiz_answer:   '✏️',
  time_on_page:  '⏱',
  link_click:    '🔗',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function fmtSeconds(s: number) {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export function UserEngagementDrawer({ userId, username, onClose }: Props) {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['user-events', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data as Event[]
    },
  })

  // Compute summary stats
  const views   = events.filter(e => e.event_type === 'article_view')
  const times   = events.filter(e => e.event_type === 'time_on_page')
  const scrolls = events.filter(e => e.event_type === 'scroll_depth')
  const totalSecs = times.reduce((acc, e) => acc + ((e.properties.seconds as number) || 0), 0)
  const maxDepth = scrolls.length
    ? Math.max(...scrolls.map(e => (e.properties.percent as number) || 0))
    : 0
  const uniqueArticles = new Set(views.map(e => e.article_slug)).size

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,18,8,0.45)',
          zIndex: 200,
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(520px, 100vw)',
        background: 'var(--paper)',
        borderLeft: '2px solid var(--ink)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--dust2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--ink)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
              Engagement Audit
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              {username ?? userId.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Summary stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          borderBottom: '1px solid var(--dust2)',
          flexShrink: 0,
        }}>
          {[
            { label: 'Articles', value: uniqueArticles },
            { label: 'Sessions', value: new Set(events.map(e => e.session_id)).size },
            { label: 'Read time', value: fmtSeconds(totalSecs) },
            { label: 'Max scroll', value: maxDepth ? `${maxDepth}%` : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '14px 12px',
              borderRight: '1px solid var(--dust2)',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)', margin: 0 }}>
                {value}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', margin: '2px 0 0' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Event timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {isLoading ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>
              Loading events…
            </p>
          ) : events.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>
              No events recorded yet.
            </p>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', left: 14, top: 8, bottom: 8,
                width: 1, background: 'var(--dust2)',
              }} />

              {events.map((ev) => {
                const props = ev.properties
                let detail = ''
                if (ev.event_type === 'scroll_depth') detail = `${props.percent}% read`
                else if (ev.event_type === 'time_on_page') detail = `${fmtSeconds(props.seconds as number)} on page`
                else if (ev.event_type === 'quiz_answer') detail = `Answered: ${props.answer ?? '—'}`
                else if (ev.event_type === 'link_click') detail = String(props.href ?? '')
                else if (ev.event_type === 'article_view') detail = `v${props.version ?? 1}`

                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                    {/* Dot */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--paper-2)',
                      border: '1.5px solid var(--dust2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', flexShrink: 0, zIndex: 1,
                    }}>
                      {EVENT_ICONS[ev.event_type] ?? '•'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, paddingTop: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)', fontWeight: 600 }}>
                          {ev.event_type.replace(/_/g, ' ')}
                        </span>
                        {ev.article_slug && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', background: 'var(--dust)', padding: '1px 6px', borderRadius: 3 }}>
                            {ev.article_slug}
                          </span>
                        )}
                      </div>
                      {detail && (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>
                          {detail}
                        </p>
                      )}
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)', margin: '3px 0 0', letterSpacing: '0.04em' }}>
                        {fmt(ev.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
