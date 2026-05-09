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
  'tn-civic-structure': {
    file: 'tn_civics/tn-civic-structure.html',
    title: 'TN Civic Structure — Part I',
  },
  'tn-civic-structure-p2': {
    file: 'tn_civics/tn-civic-structure-p2.html',
    title: 'TN Civic Structure — Part II',
  },
  'tn-civic-structure-p3': {
    file: 'tn_civics/tn-civic-structure-p3.html',
    title: 'TN Civic Structure — Part III',
  },
  'tn-civic-structure-p4': {
    file: 'tn_civics/tn-civic-structure-p4.html',
    title: 'TN Civic Structure — Part IV',
  },
  'tn-ministries-civics': {
    file: 'tn_civics/tn-ministries-civics.html',
    title: 'TN Ministries — Civics Cheat Sheet',
  },
  'tn-elections': {
    file: 'tn_civics/tn-elections.html',
    title: 'How Elections Work in Tamil Nadu',
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
