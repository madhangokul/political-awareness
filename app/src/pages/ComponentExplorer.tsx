import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { RichTable, type ColDef } from '../components/RichTable'
import { CitationRef } from '../components/CitationRef'
import { Footnotes } from '../components/Footnotes'

const MONO: React.CSSProperties = { fontFamily: "'Space Mono', monospace" }
const INTER: React.CSSProperties = { fontFamily: 'Inter, system-ui, sans-serif' }

// ── Rich table demo data ──────────────────────────────────────────────────
type StateRow = {
  state: string; sdg: number; debt: number; trend: number[]
  dev: number; status: string
}
const TABLE_COLS: ColDef<StateRow>[] = [
  { key: 'state',  label: 'State',        type: 'text',      sortable: true },
  { key: 'sdg',    label: 'SDG Rank',     type: 'number',    sortable: true },
  { key: 'debt',   label: 'Debt / GSDP',  type: 'barfill',   sortable: true, max: 50 },
  { key: 'trend',  label: 'NITI Trend',   type: 'sparkline' },
  { key: 'dev',    label: 'Devolution %', type: 'number',    sortable: true },
  { key: 'status', label: 'Status',       type: 'badge',     sortable: true,
    badgeMap: {
      Strong: { label: 'Strong', color: 'var(--teal)' },
      Watch:  { label: 'Watch',  color: '#D4810A'     },
      Weak:   { label: 'Weak',   color: 'var(--red)'  },
    },
  },
]
const TABLE_DATA: StateRow[] = [
  { state: 'Kerala',        sdg: 2,  debt: 34.1, trend: [70,71,72,74,76,76], dev: 1.9,  status: 'Strong' },
  { state: 'Tamil Nadu',    sdg: 6,  debt: 28.8, trend: [68,70,71,71,72,73], dev: 4.1,  status: 'Watch'  },
  { state: 'Gujarat',       sdg: 10, debt: 22.3, trend: [66,67,69,70,70,70], dev: 6.3,  status: 'Watch'  },
  { state: 'Maharashtra',   sdg: 13, debt: 19.8, trend: [64,65,67,68,67,68], dev: 6.3,  status: 'Watch'  },
  { state: 'Telangana',     sdg: 11, debt: 28.9, trend: [62,63,65,66,67,67], dev: 2.5,  status: 'Watch'  },
  { state: 'Rajasthan',     sdg: 25, debt: 36.1, trend: [54,55,55,56,56,57], dev: 5.8,  status: 'Weak'   },
  { state: 'Uttar Pradesh', sdg: 28, debt: 33.5, trend: [50,51,52,53,53,54], dev: 17.9, status: 'Weak'   },
  { state: 'Bihar',         sdg: 36, debt: 38.2, trend: [48,49,50,51,51,52], dev: 10.1, status: 'Weak'   },
]

const sectionHead: React.CSSProperties = {
  display: 'flex', alignItems: 'baseline', gap: 16,
  margin: '72px 0 36px',
  paddingBottom: 12,
  borderBottom: '3px solid var(--ink)',
}
const sectionNum: React.CSSProperties = { ...MONO, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)' }
const sectionTitle: React.CSSProperties = { ...INTER, fontWeight: 900, fontSize: 26, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }
const figCaption: React.CSSProperties = { fontSize: 11, color: 'var(--muted)', marginTop: 8, fontStyle: 'italic', ...MONO }

export function ComponentExplorer() {
  const barRef   = useRef<HTMLCanvasElement>(null)
  const lineRef  = useRef<HTMLCanvasElement>(null)
  const donutRef = useRef<HTMLCanvasElement>(null)
  const charts   = useRef<Record<string, any>>({})

  useEffect(() => {
    const C = (window as any).Chart
    if (!C) return

    if (barRef.current) {
      charts.current.bar = new C(barRef.current, {
        type: 'bar',
        data: {
          labels: ['UP', 'Gujarat', 'Bihar', 'Rajasthan', 'MH', 'Karnataka', 'Tamil Nadu'],
          datasets: [{
            label: '₹ per capita',
            data: [4820, 5100, 3800, 4600, 3200, 2800, 2100],
            backgroundColor: ['#D4810A99','#D4810A99','#D4810A99','#D4810A99','#D4810A99','#1a584899','#1a584899'],
            borderColor:     ['#D4810A',  '#D4810A',  '#D4810A',  '#D4810A',  '#D4810A',  '#1a5848',  '#1a5848'],
            borderWidth: 1.5,
          }],
        },
        options: {
          indexAxis: 'y', responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { title: { display: true, text: '₹ per capita (indicative)' } }, y: { grid: { display: false } } },
        },
      })
    }

    if (lineRef.current) {
      charts.current.line = new C(lineRef.current, {
        type: 'line',
        data: {
          labels: ['2018','2019','2020','2021','2022','2023','2024'],
          datasets: [{
            label: 'Debt / GSDP %',
            data: [24.8, 25.5, 26.8, 27.5, 27.9, 28.3, 28.8],
            borderColor: '#D4810A',
            backgroundColor: '#D4810A18',
            fill: true, tension: 0.4,
            pointRadius: 4, pointBackgroundColor: '#D4810A',
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { min: 22, max: 32, title: { display: true, text: '% of GSDP' } }, x: { grid: { display: false } } },
        },
      })
    }

    if (donutRef.current) {
      charts.current.donut = new C(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['GST/Commercial', 'TASMAC', 'Stamps & Reg', 'Motor Vehicle', 'Other'],
          datasets: [{
            data: [47, 15, 12, 9, 17],
            backgroundColor: ['#1a386899','#D4810A99','#1a584899','#8b202099','#8a7d6899'],
            borderColor:     ['#1a3868',  '#D4810A',  '#1a5848',  '#8b2020',  '#8a7d68'],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10 } } },
        },
      })
    }

    return () => {
      Object.values(charts.current).forEach((c: any) => c?.destroy())
      charts.current = {}
    }
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 120px' }}>

      {/* ── Hero ── */}
      <div style={{ padding: '64px 0 48px', borderBottom: '2px solid var(--ink)' }}>
        <span style={{ ...MONO, display: 'block', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>
          Design System · Component Explorer
        </span>
        <h1 style={{ ...INTER, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 76px)', lineHeight: 0.95, letterSpacing: '-0.04em', marginBottom: 20, color: 'var(--ink)' }}>
          Every piece,<br />
          <span style={{ color: 'var(--accent)' }}>in one place.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 0 }}>
          A live reference for the typography, data visualizations, and UI patterns used across this site.
          All components below are rendered exactly as they appear in published articles.
        </p>
      </div>

      {/* ── 01 TYPOGRAPHY ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>01</span>
          <span style={sectionTitle}>Typography</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {([
            {
              label: 'Display 900 · –4% tracking · Inter',
              el: <h1 style={{ ...INTER, fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1, letterSpacing: '-0.04em', margin: 0 }}>The Full Picture</h1>,
            },
            {
              label: 'Heading 2 · 800 · Inter',
              el: <h2 style={{ ...INTER, fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Where Tamil Nadu Leads — and Where It Fails</h2>,
            },
            {
              label: 'Heading 3 · 700 · Inter',
              el: <h3 style={{ ...INTER, fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: '-0.01em' }}>TASMAC and Structural Conflicts</h3>,
            },
            {
              label: 'Body · Literata 400 · 1.75 leading',
              el: <p style={{ fontFamily: 'Literata, Georgia, serif', fontSize: 16, lineHeight: 1.75, margin: 0, maxWidth: 640, color: 'var(--ink)' }}>
                Most political opinions are inherited — from family, region, language, or the last thing you read.
                That's not a flaw. It's human. But it's worth occasionally asking: do I hold this view because I examined it,
                or because it was handed to me?
              </p>,
            },
            {
              label: 'Mono · Space Mono 400',
              el: <code style={{ ...MONO, fontSize: 12, letterSpacing: '0.05em', color: 'var(--ink)' }}>v1 · 2024-05-09 · Factual · Cited · Both-Sided</code>,
            },
          ] as { label: string; el: React.ReactNode }[]).map(({ label, el }) => (
            <div key={label} className="type-specimen-row">
              <span style={{ ...MONO, display: 'block', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', paddingTop: 4, lineHeight: 1.6 }}>{label}</span>
              <div>{el}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 STAT CALLOUTS ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>02</span>
          <span style={sectionTitle}>Stat Callouts</span>
        </div>
        <div className="stat-grid">
          {([
            { num: '28.8%',   label: 'TN Debt / GSDP',        sub: 'FY 2023–24' },
            { num: '₹44K cr', label: 'TASMAC Revenue',         sub: 'Annual 2023–24' },
            { num: '#6',      label: 'SDG Index Rank',         sub: 'Nationally' },
            { num: '15%',     label: 'Of Own Tax Revenue',     sub: 'From alcohol sales' },
            { num: '4.1%',    label: 'Devolution Received',    sub: 'Contributes 10.2%' },
          ] as { num: string; label: string; sub: string }[]).map(({ num, label, sub }) => (
            <div key={label} style={{ background: '#111', padding: '28px 20px' }}>
              <div style={{ ...INTER, fontWeight: 900, fontSize: 'clamp(32px,4vw,48px)', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.03em' }}>{num}</div>
              <div style={{ ...MONO, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,246,238,0.6)', marginTop: 10 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,246,238,0.3)', marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 DATA TABLE ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>03</span>
          <span style={sectionTitle}>Data Table</span>
        </div>
        <RichTable cols={TABLE_COLS} rows={TABLE_DATA} pageSize={5} />
      </section>

      {/* ── 04 CHARTS ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>04</span>
          <span style={sectionTitle}>Charts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {([
            { label: 'Bar — Horizontal', ref: barRef, caption: 'Fig 1 — Central railway spend per capita by state (indicative, 2014–24 avg)' },
            { label: 'Line — Area fill',  ref: lineRef, caption: 'Fig 2 — TN public debt as % of GSDP, 2018–2024' },
            { label: 'Doughnut — Composition', ref: donutRef, caption: 'Fig 3 — TN own revenue composition breakdown (2023–24)' },
          ] as { label: string; ref: React.RefObject<HTMLCanvasElement>; caption: string }[]).map(({ label, ref, caption }) => (
            <div key={label}>
              <span style={{ ...MONO, display: 'block', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>{label}</span>
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--dust)', padding: '24px 20px' }}>
                <canvas ref={ref} height={240} />
              </div>
              <p style={figCaption}>{caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 05 CALLOUT BOXES ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>05</span>
          <span style={sectionTitle}>Callout Boxes</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {([
            { label: 'Think About It', color: '#D4810A', bg: 'rgba(212,129,10,0.06)',  text: "If a government earns 15% of its own-source revenue from alcohol sales, can it genuinely pursue alcohol reform? The structural incentive runs in exactly the opposite direction." },
            { label: 'Documented Fact', color: '#1a5848', bg: 'rgba(26,88,72,0.06)',   text: "TN ranked 6th nationally on the NITI Aayog SDG India Index 2023–24, scoring above the national average on health, education, and infrastructure indicators." },
            { label: 'Watch This',     color: '#8b2020', bg: 'rgba(139,32,32,0.06)',   text: "Tamil Nadu's fiscal deficit has widened consistently since 2015. The debt-to-GSDP ratio crossed 28% in 2023–24, well above the FRBM target of 25%." },
            { label: 'Context',        color: '#8a7d68', bg: 'rgba(138,125,104,0.06)', text: "All Indian states carry debt. The question is whether the trajectory is sustainable and whether borrowings are funding productive capital or current revenue expenditure." },
          ] as { label: string; color: string; bg: string; text: string }[]).map(({ label, color, bg, text }) => (
            <div key={label} style={{ background: bg, borderLeft: `4px solid ${color}`, padding: '14px 20px' }}>
              <div style={{ ...MONO, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color, marginBottom: 8 }}>{label}</div>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', fontStyle: 'italic' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 06 BADGES & PILLS ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>06</span>
          <span style={sectionTitle}>Badges &amp; Pills</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* Card tags — muted */}
          {['Philosophy · History', 'Data · Cited · Balanced', 'Analysis'].map(t => (
            <span key={t} style={{ ...MONO, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--dust)', borderRadius: 2, padding: '3px 8px' }}>{t}</span>
          ))}
          {/* Card tags — teal */}
          {['Factual', 'Both-Sided'].map(t => (
            <span key={t} style={{ ...MONO, fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--teal)', border: '1px solid var(--teal)', borderRadius: 2, padding: '3px 8px' }}>{t}</span>
          ))}
          {/* Pill chips */}
          {['No Agenda', 'Interactive', '2024–25'].map(t => (
            <span key={t} style={{ ...MONO, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', background: 'var(--paper3)', borderRadius: 2, padding: '3px 7px' }}>{t}</span>
          ))}
          {/* Role badges */}
          {([{ label: 'Admin', color: 'var(--accent)' }, { label: 'Reviewer', color: 'var(--teal)' }, { label: 'Reader', color: 'var(--muted)' }] as { label: string; color: string }[]).map(({ label, color }) => (
            <span key={label} style={{ ...MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '1px 5px', border: `1px solid ${color}`, borderRadius: 2, color }}>{label}</span>
          ))}
        </div>
      </section>

      {/* ── 07 TIMELINE ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>07</span>
          <span style={sectionTitle}>Timeline</span>
        </div>
        <div>
          {([
            { year: '1949', title: 'Dravidam Kazhagam founded',        body: "Periyar's political party formally established with the goal of social justice and self-respect for non-Brahmin communities in the Madras Presidency." },
            { year: '1949', title: 'Dravida Munnetra Kazhagam splits', body: 'C.N. Annadurai leads a group away from DK to form DMK, retaining the Dravidian social ideology but adding Tamil nationalism and electoral strategy.' },
            { year: '1967', title: 'DMK wins Madras state elections',  body: 'First non-Congress government in any large Indian state. Anna becomes Chief Minister. The Dravidian model enters governance for the first time.' },
            { year: '1972', title: 'AIADMK founded by MGR',            body: 'MGR splits from DMK to form AIADMK, fracturing the movement. Tamil Nadu enters the two-party Dravidian political lock that persists today.' },
          ] as { year: string; title: string; body: string }[]).map(({ year, title, body }, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '0 24px', position: 'relative' }}>
              <div style={{ textAlign: 'right', paddingTop: 2 }}>
                <span style={{ ...MONO, fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>{year}</span>
              </div>
              <div style={{ borderLeft: '2px solid var(--dust)', paddingLeft: 24, paddingBottom: 28, position: 'relative' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--paper)', position: 'absolute', left: -6, top: 4 }} />
                <div style={{ ...INTER, fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--ink)' }}>{title}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 08 SCORE BARS ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>08</span>
          <span style={sectionTitle}>Score Bars</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
          {([
            { label: 'SDG Performance',         value: 73, color: 'var(--teal)',   verdict: 'Strong' },
            { label: 'Fiscal Sustainability',    value: 55, color: '#D4810A',      verdict: 'Watch' },
            { label: 'Revenue Diversification',  value: 42, color: '#8b2020',      verdict: 'Weak' },
            { label: 'Devolution Fairness',      value: 28, color: '#8b2020',      verdict: 'Skewed' },
          ] as { label: string; value: number; color: string; verdict: string }[]).map(({ label, value, color, verdict }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', ...INTER }}>{label}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ ...MONO, fontSize: 10, color }}>{value}/100</span>
                  <span style={{ ...MONO, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '2px 6px', border: `1px solid ${color}`, color, borderRadius: 2 }}>{verdict}</span>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--dust)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 09 COMPARE TABLE ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>09</span>
          <span style={sectionTitle}>Compare Grid</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Headers */}
          <div style={{ background: 'var(--accent)', color: 'var(--paper)', padding: '12px 20px' }}>
            <span style={{ ...MONO, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' }}>DMK / Dravidian Model</span>
          </div>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '12px 20px' }}>
            <span style={{ ...MONO, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase' }}>BJP / Hindutva Model</span>
          </div>
          {/* Rows */}
          {([
            ['Social justice via caste quotas', 'Merit-based advancement narrative'],
            ['Dravidian linguistic identity', 'Hindi-national cultural unity'],
            ['State-led welfare delivery', 'Direct benefit transfers'],
            ['Anti-Brahmin political tradition', 'Upper-caste coalition mobilization'],
          ] as [string, string][]).map(([a, b], i) => (
            <>
              <div key={`a-${i}`} style={{ padding: '10px 20px', background: i % 2 === 0 ? 'var(--paper2)' : 'var(--paper)', fontSize: 13.5, color: 'var(--ink)', borderBottom: '1px solid var(--dust)' }}>{a}</div>
              <div key={`b-${i}`} style={{ padding: '10px 20px', background: i % 2 === 0 ? 'var(--paper3)' : 'var(--paper2)', fontSize: 13.5, color: 'var(--muted)', borderBottom: '1px solid var(--dust)' }}>{b}</div>
            </>
          ))}
        </div>
      </section>

      {/* ── 10 CITATIONS & REFERENCES ── */}
      <section>
        <div style={sectionHead}>
          <span style={sectionNum}>10</span>
          <span style={sectionTitle}>Citations &amp; References</span>
        </div>
        <div style={{ maxWidth: 680 }}>
          {/* System description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 32 }}>
            {([
              { icon: '①', label: 'Inline anchor', desc: '<CitationRef n={1} /> — superscript that scrolls to footnote and flashes it.' },
              { icon: '↑', label: 'Back-link',     desc: 'Each footnote has a ↑ button that scrolls back to the citation and flashes the superscript.' },
              { icon: '✦', label: 'Flash pulse',   desc: 'A brief amber pulse on both ends confirms the navigation — no manual search.' },
              { icon: '→', label: 'Source link',   desc: 'Optional [source →] opens the primary source in a new tab; never disrupts reading flow.' },
            ] as { icon: string; desc: string; label: string }[]).map(({ icon, label, desc }) => (
              <div key={label} style={{ background: 'var(--paper2)', border: '1px solid var(--dust)', padding: '16px 18px' }}>
                <div style={{ ...MONO, fontSize: 18, color: 'var(--accent)', marginBottom: 8, lineHeight: 1 }}>{icon}</div>
                <div style={{ ...MONO, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Live demo */}
          <div style={{ background: 'var(--paper2)', border: '1px solid var(--dust)', padding: '28px 28px 24px', borderRadius: 2 }}>
            <span style={{ ...MONO, display: 'block', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>
              Live demo — click a citation number
            </span>
            <p style={{ fontFamily: 'Literata, Georgia, serif', fontSize: 15.5, lineHeight: 1.8, color: 'var(--ink)', margin: '0 0 16px' }}>
              Tamil Nadu's fiscal deficit has widened consistently since 2015.<CitationRef n={1} /> The
              debt-to-GSDP ratio reached 28.8% in 2023–24,<CitationRef n={2} /> well above the FRBM
              target of 25%. At the same time, TASMAC contributed ₹44,000 crore to state
              revenues<CitationRef n={3} /> — roughly 15% of own-tax revenue — creating a structural
              incentive misalignment on alcohol policy reform.
            </p>
            <p style={{ fontFamily: 'Literata, Georgia, serif', fontSize: 15.5, lineHeight: 1.8, color: 'var(--ink)', margin: 0 }}>
              Despite this, Tamil Nadu ranks 6th nationally on the NITI Aayog SDG Index<CitationRef n={4} /> and
              leads most large states on health and education outcomes.
            </p>

            <Footnotes
              title="References"
              items={[
                { n: 1, text: 'Tamil Nadu Budget Speech 2024–25, Government of Tamil Nadu Finance Department.', url: 'https://finance.tn.gov.in' },
                { n: 2, text: 'RBI State Finances: A Study of Budgets 2024–25. Table 2.3: Debt-GSDP Ratios.', url: 'https://rbi.org.in' },
                { n: 3, text: 'TASMAC Annual Report 2023–24. Gross revenue including excise duty and sales proceeds.' },
                { n: 4, text: 'NITI Aayog SDG India Index 2023–24. Tamil Nadu Score: 73/100. Rank: 6.', url: 'https://sdgindiaindex.niti.gov.in' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--dust)' }}>
        <Link to="/" style={{ ...MONO, fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to articles
        </Link>
      </div>
    </div>
  )
}
