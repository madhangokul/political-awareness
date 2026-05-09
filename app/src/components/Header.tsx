import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import { LoginModal } from '../features/auth/LoginModal'
import { NotificationBell } from '../features/notifications/NotificationBell'
import { supabase } from '../lib/supabase'

export function Header() {
  const { user, profile } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="border-b border-dust bg-paper sticky top-0 z-40">
        <div className="max-w-article mx-auto px-6 flex items-center justify-between h-12">
          {/* Site name */}
          <Link
            to="/"
            className="font-mono text-[9px] tracking-[0.28em] uppercase text-muted hover:text-ink no-underline"
          >
            Examine It Yourself
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-5">
            {(profile?.role === 'admin' || profile?.role === 'reviewer') && (
              <Link
                to="/admin"
                className="font-mono text-[9px] tracking-widest uppercase text-muted hover:text-accent"
              >
                {profile.role === 'admin' ? 'Admin' : 'Review'}
              </Link>
            )}

            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted hidden sm:block">
                  {profile?.display_name ?? profile?.username ?? ''}
                </span>
                <button
                  onClick={handleSignOut}
                  className="font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink border border-dust px-3 py-1 hover:border-ink transition-colors"
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
