import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'

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

  // Redirect directly to the static HTML file — no iframe, full native page
  useEffect(() => {
    if (meta) {
      window.location.replace(`/legacy/${meta.file}`)
    }
  }, [meta])

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
    <div style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
      Redirecting…
    </div>
  )
}
