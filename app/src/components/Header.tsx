import { Link } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'

export function Header() {
  const { isDark, toggle } = useTheme()

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}
    >
      <div className="max-w-article mx-auto px-6 flex items-center justify-between h-12">
        <Link
          to="/"
          className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/40 hover:text-white no-underline transition-colors"
        >
          Examine It Yourself
        </Link>

        <button
          onClick={toggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="font-mono text-[13px] text-white/35 hover:text-white/80 transition-colors leading-none select-none"
        >
          {isDark ? '○' : '●'}
        </button>
      </div>
    </header>
  )
}
