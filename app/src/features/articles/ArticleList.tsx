import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

// Per-article visual config — keyed by slug, fallback for unknowns
type Stripe = 'warm' | 'dark'
const CARD_META: Record<string, { tag: string; tagDark?: boolean; pills: string[]; stripe: Stripe }> = {
  'what-is-dravidianism': {
    tag: 'Philosophy · History',
    pills: ['No Agenda', 'Interactive'],
    stripe: 'warm',
  },
  'tn-governance-audit': {
    tag: 'Data · Cited · Balanced',
    tagDark: true,
    pills: ['Factual', 'Both-Sided', '2024–25'],
    stripe: 'dark',
  },
}
function cardMeta(slug: string, i: number) {
  return CARD_META[slug] ?? { tag: 'Analysis', pills: ['Read'], stripe: i % 2 === 0 ? 'warm' : 'dark' } as const
}

export function ArticleList() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, subtitle, current_version, updated_at')
        .eq('published', true)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  return (
    <>
      {/* ── Masthead ── */}
      <div className="masthead text-center">
        <span className="masthead-eyebrow">
          A Mirror, Not a Megaphone · Read Slowly · Question Everything
        </span>
        <h1>
          Know what you<br />
          <em>actually</em> believe.
        </h1>
        <p className="masthead-sub">
          A collection of long reads designed to separate philosophy from party, history from
          propaganda, and instinct from informed opinion.
        </p>
        <div className="masthead-rule" />
      </div>

      {/* ── Manifesto ── */}
      <div className="manifesto">
        <p>
          Most political opinions are inherited — from family, region, language, or the last thing
          you read. That's not a flaw. It's human. But{' '}
          <strong>it's worth occasionally asking</strong>: do I hold this view because I examined
          it, or because it was handed to me?
        </p>
        <p>
          These pieces are not partisan. They are not trying to change your vote. They are trying to
          give you <strong>the full picture</strong> — the uncomfortable parts included — so that
          whatever you believe, you believe it with your eyes open.
        </p>
      </div>

      {/* ── Article cards ── */}
      {isLoading ? (
        <p className="text-center text-muted py-16 font-mono text-sm">Loading…</p>
      ) : articles.length === 0 ? (
        <p className="text-center text-muted py-16 font-mono text-sm">No articles published yet.</p>
      ) : (
        <>
          <span className="section-label">Articles · {articles.length} published</span>
          <div className="cards">
            {articles.map((a, i) => {
              const cfg = cardMeta(a.slug, i)
              return (
                <Link key={a.id} to={`/articles/${a.slug}`} className="card">
                  <div className={`stripe stripe-${cfg.stripe}`} />
                  <div className={`card-tag${cfg.tagDark ? ' tag-dark' : ''}`}>{cfg.tag}</div>
                  <h2>{a.title}</h2>
                  {a.subtitle && <p>{a.subtitle}</p>}
                  <div className="card-meta">
                    {cfg.pills.map((pill) => (
                      <span key={pill} className="card-pill">{pill}</span>
                    ))}
                    <span className="card-arrow">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* ── Footer ── */}
      <div className="site-footer">
        <p>
          A Mirror, Not a Megaphone · No tracking · No agenda<br />
          Read slowly. Sit with the questions.
        </p>
      </div>
    </>
  )
}
