import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Screen = 'signin' | 'signup'

interface Props {
  onClose: () => void
}

export function LoginModal({ onClose }: Props) {
  const [screen, setScreen] = useState<Screen>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchScreen(s: Screen) {
    setScreen(s)
    setError(null)
    setDone(false)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else onClose()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName || undefined } },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setDone(true)
  }

  const tabs: { key: Screen; label: string }[] = [
    { key: 'signin', label: 'Sign In' },
    { key: 'signup', label: 'Sign Up' },
  ]

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-paper border-2 border-ink p-8 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="block font-mono text-[9px] tracking-[0.28em] uppercase text-muted mb-5">
          {screen === 'signup' ? 'Create Account' : 'Sign In'}
        </span>

        {/* Tab bar */}
        <div className="flex border border-dust2 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => switchScreen(t.key)}
              className={`flex-1 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                screen === t.key ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Sign In ── */}
        {screen === 'signin' && (
          <form onSubmit={handleSignIn}>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
            />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
            />
            {error && <p className="text-danger text-sm mb-3">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-ink text-paper font-mono text-xs tracking-widest uppercase py-2.5 px-4 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait…' : 'Sign In'}
            </button>
            <p className="text-center text-muted text-xs mt-4">
              No account?{' '}
              <button type="button" onClick={() => switchScreen('signup')} className="text-ink underline underline-offset-2">Sign up free</button>
            </p>
          </form>
        )}

        {/* ── Sign Up ── */}
        {screen === 'signup' && (
          done ? (
            <div>
              <p className="font-display text-xl mb-3">Welcome aboard</p>
              <p className="text-muted text-sm mb-4">
                Account created for <strong className="text-ink">{email}</strong>.
              </p>
              <button type="button" onClick={() => { setDone(false); switchScreen('signin') }}
                className="w-full bg-ink text-paper font-mono text-xs tracking-widest uppercase py-2.5 px-4 hover:bg-accent transition-colors"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignUp}>
              <input type="text" placeholder="Display name (optional)" value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
              />
              <input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
              />
              <input type="password" placeholder="Password (min 6 chars)" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
              />
              {error && <p className="text-danger text-sm mb-3">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-ink text-paper font-mono text-xs tracking-widest uppercase py-2.5 px-4 hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait…' : 'Create Account'}
              </button>
              <p className="text-center text-muted text-xs mt-4">
                Already have one?{' '}
                <button type="button" onClick={() => switchScreen('signin')} className="text-ink underline underline-offset-2">Sign in</button>
              </p>
            </form>
          )
        )}

        <button
          onClick={onClose}
          className="mt-4 text-muted text-xs hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
