// Static legacy article publisher — no auth, no DB

type LegacyCard = {
  href: string
  tag: string
  tagDark?: boolean
  title: string
  subtitle: string
  pills: string[]
  stripe: 'warm' | 'dark' | 'teal' | 'blue'
}

const AWARENESS: LegacyCard[] = [
  {
    href: '/legacy/dravidianism-awareness.html',
    tag: 'Philosophy · History',
    title: 'What is Dravidianism, actually?',
    subtitle: 'A clear-eyed look at the ideology — its origins, what it claims, and what it actually delivered.',
    pills: ['No Agenda', 'Long Read'],
    stripe: 'warm',
  },
  {
    href: '/legacy/tn-cited.html',
    tag: 'Data · Cited · Balanced',
    tagDark: true,
    title: 'Tamil Nadu — Read the Full Record',
    subtitle: 'Every major claim about TN governance, sourced. The achievements and the failures, side by side.',
    pills: ['Factual', 'Both-Sided', '2024–25'],
    stripe: 'dark',
  },
]

const CIVICS: LegacyCard[] = [
  {
    href: '/legacy/tn_civics/tn-civic-structure.html',
    tag: 'Civics · Part I',
    title: 'TN Civic Structure — Power & Governance',
    subtitle: 'How the state is structured from the Governor down to the Village Panchayat. Who holds what power.',
    pills: ['Reference', 'Interactive'],
    stripe: 'blue',
  },
  {
    href: '/legacy/tn_civics/tn-civic-structure-p2.html',
    tag: 'Civics · Part II',
    title: 'The 7th Schedule, Agencies & Revenue Chain',
    subtitle: 'Who can make law on what, central investigative agencies in TN, and how revenue administration works.',
    pills: ['Reference', 'Tables'],
    stripe: 'teal',
  },
  {
    href: '/legacy/tn_civics/tn-civic-structure-p3.html',
    tag: 'Civics · Part III',
    title: 'Legislature, Courts & Civil Service',
    subtitle: 'How the Assembly functions day-to-day, High Court writ jurisdiction, TNPSC, and state PSUs.',
    pills: ['Reference', 'Judiciary'],
    stripe: 'blue',
  },
]

const REFERENCE: LegacyCard[] = [
  {
    href: '/legacy/tn_civics/tn-ministries-civics.html',
    tag: 'Cheat Sheet · Ministries',
    title: 'TN Ministries — Civics Cheat Sheet',
    subtitle: 'What each ministry actually controls, its key departments, and who does what inside the secretariat.',
    pills: ['Quick Reference', 'Tables'],
    stripe: 'warm',
  },
]

function Card({ card }: { card: LegacyCard }) {
  const stripeStyle: Record<string, string> = {
    warm: 'linear-gradient(90deg, var(--accent), var(--gold))',
    dark: 'linear-gradient(90deg, #1a5848, #18b898)',
    teal: 'linear-gradient(90deg, #0891b2, #0d9488)',
    blue: 'linear-gradient(90deg, #1d4ed8, #7c3aed)',
  }
  return (
    <a href={card.href} className="card" style={{ textDecoration: 'none' }}>
      <div className="stripe" style={{ background: stripeStyle[card.stripe] }} />
      <div className={`card-tag${card.tagDark ? ' tag-dark' : ''}`}>{card.tag}</div>
      <h2>{card.title}</h2>
      <p>{card.subtitle}</p>
      <div className="card-meta">
        {card.pills.map(pill => (
          <span key={pill} className="card-pill">{pill}</span>
        ))}
        <span className="card-arrow">→</span>
      </div>
    </a>
  )
}

function Section({ label, cards }: { label: string; cards: LegacyCard[] }) {
  return (
    <>
      <span className="section-label">{label}</span>
      <div className="cards">
        {cards.map(card => <Card key={card.href} card={card} />)}
      </div>
    </>
  )
}

export function ArticleList() {
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
          Hand-written HTML articles on Tamil Nadu politics, governance, and civics.
          No login. No algorithm. Just the page.
        </p>
        <div className="masthead-rule" />
      </div>

      {/* ── Awareness Articles ── */}
      <Section label="Awareness · 2 articles" cards={AWARENESS} />

      {/* ── Civic Structure Series ── */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--dust)' }}>
        <Section label="TN Civic Structure · 3-part series" cards={CIVICS} />
      </div>

      {/* ── Reference Sheets ── */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--dust)' }}>
        <Section label="Reference Sheets · 1 page" cards={REFERENCE} />
      </div>

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
