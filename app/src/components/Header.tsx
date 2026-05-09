import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import { LoginModal } from '../features/auth/LoginModal'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { supabase } from '../lib/supabase'
import { useTheme } from '../lib/useTheme'

export function Header() {
  const { user, profile } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const { isDark, toggle } = useTheme()

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header
        className="sticky top-0 z-40"
        style={{ background: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}
      >
        <div className="max-w-article mx-auto px-6 flex items-center justify-between h-12">
          {/* Site name */}
          <Link
            to="/"
            className="font-mono text-[9px] tracking-[0.28em] uppercase text-white/40 hover:text-white no-underline transition-colors"
          >
            Examine It Yourself
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-5">
            <Link
              to="/components"
              className="font-mono text-[9px] tracking-widest uppercase text-white/25 hover:text-white/60 transition-colors"
            >
              UI Kit
            </Link>

            {(profile?.role === 'admin' || profile?.role === 'reviewer') && (
              <Link
                to="/admin"
                className="font-mono text-[9px] tracking-widest uppercase text-white/40 hover:text-[#D4810A] transition-colors"
              >
                {profile.role === 'admin' ? 'Admin' : 'Review'}
              </Link>
            )}

            <NotificationBell />

            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="font-mono text-[13px] text-white/35 hover:text-white/80 transition-colors leading-none select-none"
            >
              {isDark ? '○' : '●'}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-white/30 hidden sm:block">
                  {profile?.display_name ?? profile?.username ?? ''}
                </span>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-[9px] uppercase tracking-wider text-white/40 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="font-mono text-[9px] uppercase tracking-wider text-[#D4810A] border border-[#D4810A]/50 px-3 py-1 hover:bg-[#D4810A] hover:text-[#111] transition-colors"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
