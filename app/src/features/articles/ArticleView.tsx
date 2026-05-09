import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { LoginModal } from '../auth/LoginModal'
import { CommentThread } from '../comments/CommentThread'
import { useTrack } from '../analytics/useTrack'

declare global {
  interface Window {
    answer: (qNum: number, opt: string) => void
    g: (id: string) => void
    toggleRef: (el: HTMLElement) => void
    toggleHC: (id: string) => void
    __articleCharts: Record<string, unknown>
  }
}

export function ArticleView() {
  const { slug } = useParams<{ slug: string }>()
  const { user, loading: authLoading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const htmlRef = useRef<HTMLDivElement>(null)
  const { track, attachScrollTracker } = useTrack(slug)
  const viewStartRef = useRef<number>(Date.now())

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })

  const { data: currentVersion, isLoading: versionLoading } = useQuery({
    queryKey: ['version', article?.id, article?.current_version],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_versions')
        .select('*')
        .eq('article_id', article!.id)
        .eq('version_number', article!.current_version)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!article && !!user,
  })

  const content = currentVersion?.content ?? ''
  const isHtml = content.trimStart().startsWith('<')

  // Track article_view once content loads; track time_on_page on unmount
  useEffect(() => {
    if (!user || !article || !currentVersion) return
    viewStartRef.current = Date.now()
    track('article_view', { title: article.title, version: article.current_version })
    return () => {
      const seconds = Math.round((Date.now() - viewStartRef.current) / 1000)
      track('time_on_page', { seconds })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentVersion?.id])

  // Attach scroll depth tracker to rendered content
  useEffect(() => {
    if (!user || !htmlRef.current) return
    return attachScrollTracker(htmlRef.current)
  }, [user, attachScrollTracker, currentVersion?.id])

  // Activate all interactive JS after HTML content is rendered
  useEffect(() => {
    if (!isHtml || !currentVersion) return

    // Quiz answer handler (dravidianism)
    window.answer = (qNum: number, _opt: string) => {
      const item = document.getElementById('q' + qNum)
      if (!item) return
      const opts = item.querySelectorAll('.q-opt')
      const ref = document.getElementById('r' + qNum)
      const ev = window.event as MouseEvent
      opts.forEach(o => {
        ;(o as HTMLButtonElement).disabled = true
        o.classList.remove('selected')
      })
      ;(ev?.target as HTMLElement)?.classList.add('selected')
      item.classList.add('revealed')
      setTimeout(() => ref?.classList.add('show'), 300)
    }

    // Smooth scroll to section (dravidianism nav dots)
    window.g = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Reflection accordion toggle (dravidianism)
    window.toggleRef = (el: HTMLElement) => {
      el.querySelector('.ref-q-expand')?.classList.toggle('open')
    }

    // Hidden cost accordion toggle (tn-cited)
    window.toggleHC = (id: string) => {
      document.getElementById(id)?.classList.toggle('open')
    }

    // Progress bar + back-to-top scroll handler
    const handleScroll = () => {
      const doc = document.documentElement
      const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100
      const prog = document.getElementById('prog')
      if (prog) prog.style.width = pct + '%'
      const btt = document.getElementById('btt')
      if (btt) btt.classList.toggle('show', doc.scrollTop > 400)
    }
    window.addEventListener('scroll', handleScroll)

    // Nav dot section tracker (dravidianism)
    const sections = ['quiz', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7']
    const updateDots = () => {
      const dots = document.querySelectorAll('.nav-dot')
      let current = 0
      sections.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) current = i
      })
      dots.forEach((d, i) => d.classList.toggle('active', i === current))
    }
    window.addEventListener('scroll', updateDots)

    // Fade-up / fade-in on scroll via IntersectionObserver
    const fadeObserver = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.07 }
    )
    document.querySelectorAll('.fade-up, .up').forEach(el => fadeObserver.observe(el))

    // Reference highlight on cite link click (tn-cited)
    const container = htmlRef.current
    if (container) {
      container.querySelectorAll('a.ref[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
          const targetId = link.getAttribute('href')?.replace('#', '')
          if (!targetId) return
          const target = document.getElementById(targetId)
          if (target) {
            document.querySelectorAll('.ref-item').forEach(r => r.classList.remove('highlighted'))
            setTimeout(() => target.classList.add('highlighted'), 300)
            setTimeout(() => target.classList.remove('highlighted'), 2500)
          }
        })
      })
    }

    // Theme toggle button (tn-cited)
    const tBtn = document.getElementById('tBtn')
    if (tBtn) {
      let light = false
      const onTheme = () => {
        light = !light
        const wrapper = document.querySelector('[data-theme]')
        if (wrapper) wrapper.setAttribute('data-theme', light ? 'light' : 'dark')
        tBtn.textContent = light ? '🌙' : '☀️'
        rebuildCharts()
      }
      tBtn.addEventListener('click', onTheme)
    }

    // Chart.js initialization (tn-cited)
    function gv(v: string) {
      return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
    }
    window.__articleCharts = {}

    function rebuildCharts() {
      const C = (window as any).Chart
      if (!C) return
      Object.values(window.__articleCharts).forEach((c: any) => c?.destroy())
      window.__articleCharts = {}
      C.defaults.color = gv('--tx2')
      C.defaults.borderColor = gv('--bdr')
      C.defaults.font.family = "'Crimson Pro', Georgia, serif"
      C.defaults.font.size = 11
      buildDebt(); buildRevenue(); buildRailway(); buildDevolution()
    }

    function buildDebt() {
      const C = (window as any).Chart
      const ctx = document.getElementById('cDebt') as HTMLCanvasElement | null
      if (!ctx || !C) return
      window.__articleCharts.debt = new C(ctx, {
        type: 'line',
        data: {
          labels: ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],
          datasets: [{ label: 'TN Debt / GSDP %', data: [23.1,23.8,24.2,24.8,25.5,26.8,27.5,27.9,28.3,28.8], borderColor: gv('--amber'), backgroundColor: gv('--amber')+'18', fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: gv('--amber') }]
        },
        options: { responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.raw}% of GSDP` } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: gv('--bdr')+'55' }, title: { display: true, text: '% of GSDP' }, min: 20, max: 32 } } }
      })
    }

    function buildRevenue() {
      const C = (window as any).Chart
      const ctx = document.getElementById('cRevenue') as HTMLCanvasElement | null
      if (!ctx || !C) return
      window.__articleCharts.rev = new C(ctx, {
        type: 'doughnut',
        data: { labels: ['Commercial Taxes (GST)', 'TASMAC Revenue', 'Stamps & Registration', 'Motor Vehicle Tax', 'Other'], datasets: [{ data: [47,15,12,9,17], backgroundColor: [gv('--blue')+'cc',gv('--red')+'cc',gv('--teal')+'cc',gv('--amber')+'cc',gv('--gray')+'cc'], borderColor: gv('--bg2'), borderWidth: 2 }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 10 } } }, tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.raw}%` } } } }
      })
    }

    function buildRailway() {
      const C = (window as any).Chart
      const ctx = document.getElementById('cRailway') as HTMLCanvasElement | null
      if (!ctx || !C) return
      const bjpSet = new Set([0,1,2,3,4])
      const labels = ['UP','Gujarat','MP','Bihar','Rajasthan','Maharashtra','Karnataka','Tamil Nadu','Kerala']
      const vals = [4820,5100,4200,3800,4600,3200,2800,2100,1950]
      window.__articleCharts.rail = new C(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: '₹ per capita (indicative avg)', data: vals, backgroundColor: labels.map((_,i) => bjpSet.has(i) ? gv('--amber')+'cc' : gv('--teal')+'cc'), borderColor: labels.map((_,i) => bjpSet.has(i) ? gv('--amber') : gv('--teal')), borderWidth: 1 }] },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { afterLabel: (c: any) => bjpSet.has(c.dataIndex) ? '🟡 BJP-aligned state' : '🟢 Non-BJP state' } } }, scales: { x: { grid: { color: gv('--bdr')+'55' }, title: { display: true, text: '₹ per capita (2014-24 avg, indicative)' } }, y: { grid: { display: false } } } }
      })
    }

    function buildDevolution() {
      const C = (window as any).Chart
      const ctx = document.getElementById('cDevolution') as HTMLCanvasElement | null
      if (!ctx || !C) return
      window.__articleCharts.dev = new C(ctx, {
        type: 'bar',
        data: { labels: ['Tamil Nadu','Karnataka','Maharashtra','Kerala','UP','Bihar','MP'], datasets: [{ label: 'Contributes to pool %', data: [10.2,8.1,16.1,4.2,8.0,2.8,3.9], backgroundColor: gv('--red')+'99', borderColor: gv('--red'), borderWidth: 1.5 }, { label: 'Receives back %', data: [4.1,3.7,6.3,1.9,17.9,10.1,7.5], backgroundColor: gv('--teal')+'99', borderColor: gv('--teal'), borderWidth: 1.5 }] },
        options: { responsive: true, plugins: { legend: { position: 'top', labels: { boxWidth: 10, padding: 10 } } }, scales: { x: { grid: { display: false }, ticks: { maxRotation: 30, font: { size: 10 } } }, y: { grid: { color: gv('--bdr')+'55' }, title: { display: true, text: '% of national total' } } } }
      })
    }

    if (document.getElementById('cDebt')) {
      rebuildCharts()
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', updateDots)
      fadeObserver.disconnect()
      Object.values(window.__articleCharts || {}).forEach((c: any) => c?.destroy())
      window.__articleCharts = {}
      delete (window as any).answer
      delete (window as any).g
      delete (window as any).toggleRef
      delete (window as any).toggleHC
    }
  }, [isHtml, currentVersion?.id])

  if (authLoading || articleLoading || (user && versionLoading)) {
    return <p className="text-center text-muted py-16 font-mono text-sm">Loading…</p>
  }

  if (!article) {
    return <p className="text-center text-muted py-16">Article not found.</p>
  }

  // ── Auth gate — show title but block content ───────────────────────────────
  if (!user) {
    return (
      <>
        <div className="article-masthead" style={{ marginBottom: 0 }}>
          <span className="masthead-label">Sign in to read</span>
          <h1>{article.title}</h1>
          {article.subtitle && (
            <p className="masthead-sub">{article.subtitle}</p>
          )}
        </div>

        <div className="article-nav" style={{ marginTop: '1.5rem' }}>
          <Link to="/" className="article-nav-back">← All Articles</Link>
        </div>

        {/* Content gate */}
        <div style={{
          margin: '3rem auto',
          maxWidth: 480,
          textAlign: 'center',
          padding: '3rem 2rem',
          border: '1px solid var(--dust2)',
          background: 'var(--paper-2)',
        }}>
          <p className="font-mono" style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
            Members only
          </p>
          <p className="font-display" style={{ fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
            This article is for signed-in readers
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Every claim here carries a citation. Sign in to read, fact-check, and join the discussion.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: 'var(--ink)',
              color: 'var(--paper)',
              border: 'none',
              padding: '0.75rem 2rem',
              cursor: 'pointer',
            }}
          >
            Sign in to continue
          </button>
        </div>

        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    )
  }

  // ── HTML article mode ──────────────────────────────────────────────────────
  if (isHtml) {
    return (
      <>
        {/* Slim back-nav always visible at top */}
        <div className="article-nav wrap" style={{ marginBottom: 0 }}>
          <Link to="/" className="article-nav-back">← All Articles</Link>
          <div className="article-nav-right">
            <span className="article-nav-ver">v{article.current_version}</span>
            <span className="article-nav-sep">·</span>
            <Link to={`/articles/${slug}/history`} className="article-nav-hist">
              History
            </Link>
          </div>
        </div>
        {/* Raw HTML article body — includes its own masthead, progress bar, etc. */}
        <div
          ref={htmlRef}
          dangerouslySetInnerHTML={{ __html: content }}
          onClick={(e) => {
            const a = (e.target as HTMLElement).closest('a[href]')
            if (a) track('link_click', { href: a.getAttribute('href') })
          }}
        />
        {/* Comment thread */}
        {currentVersion && (
          <div className="wrap">
            <CommentThread
              articleId={article.id}
              versionId={currentVersion.id}
              articleSlug={slug!}
            />
          </div>
        )}
      </>
    )
  }

  // ── Markdown article mode ──────────────────────────────────────────────────
  return (
    <article>
      <div className="article-masthead">
        <span className="masthead-label">
          A Question Journey · For Curious Minds · No Agenda
        </span>
        <h1>{article.title}</h1>
        {article.subtitle && (
          <p className="masthead-sub">{article.subtitle}</p>
        )}
        {article.subtitle && (
          <div className="intent-box">
            This piece does not argue for or against any party. It is an attempt to separate
            philosophy from politicians — to examine ideas on their own terms, not through the
            lens of who carried them most recently.
          </div>
        )}
      </div>

      <div className="article-nav">
        <Link to="/" className="article-nav-back">← All Articles</Link>
        <div className="article-nav-right">
          <span className="article-nav-ver">v{article.current_version}</span>
          <span className="article-nav-sep">·</span>
          <Link to={`/articles/${slug}/history`} className="article-nav-hist">
            Version History
          </Link>
        </div>
      </div>

      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>

      {currentVersion && (
        <CommentThread
          articleId={article.id}
          versionId={currentVersion.id}
          articleSlug={slug!}
        />
      )}
    </article>
  )
}
