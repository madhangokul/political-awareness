import { useParams, Link } from 'react-router-dom'

// Map slug → { filename, title }
const LEGACY_ARTICLES: Record<string, { file: string; title: string }> = {
  'dravidianism-awareness': {
    file: 'dravidianism-awareness.html',
    title: 'What is Dravidianism, actually?',
  },
  'tn-cited': {
    file: 'tn-cited.html',
    title: 'Tamil Nadu — Read the Full Record',
  },
  'tn-flaws-alignment-costs': {
    file: 'tn-flaws-alignment-costs.html',
    title: 'TN Flaws & Alignment Costs',
  },
}

export function LegacyView() {
  const { slug = '' } = useParams<{ slug: string }>()
  const meta = LEGACY_ARTICLES[slug]

  if (!meta) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          LEGACY / 404
        </p>
        <p style={{ marginTop: 16 }}>No legacy article found for "{slug}".</p>
        <Link to="/" style={{ color: 'var(--accent)', marginTop: 16, display: 'inline-block' }}>
          ← Back home
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
      {/* Legacy banner */}
      <div
        style={{
          background: 'var(--ink)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.07)',
            padding: '2px 8px',
            borderRadius: 3,
          }}
        >
          Legacy · Static HTML
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {meta.title}
        </span>
        <Link
          to="/"
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          ← Back to site
        </Link>
      </div>

      {/* The original HTML file in a full-height iframe */}
      <iframe
        src={`/legacy/${meta.file}`}
        title={meta.title}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          minHeight: 'calc(100vh - 100px)',
        }}
      />
    </div>
  )
}
