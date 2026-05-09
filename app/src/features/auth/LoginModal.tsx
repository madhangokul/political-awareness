import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Mode = 'password' | 'otp'

interface Props {
  onClose: () => void
}

export function LoginModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSent(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
      } else {
        onClose()
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      setLoading(false)
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    }
  }

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
          Sign In
        </span>

        {/* Mode toggle */}
        <div className="flex border border-dust2 mb-6">
          <button
            type="button"
            onClick={() => switchMode('password')}
            className={`flex-1 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
              mode === 'password' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => switchMode('otp')}
            className={`flex-1 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
              mode === 'otp' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            Magic Link
          </button>
        </div>

        {sent ? (
          <div>
            <p className="font-display text-xl mb-3">Check your inbox</p>
            <p className="text-muted text-sm">
              We sent a magic link to <strong className="text-ink">{email}</strong>.
              Click the link to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
            />
            {mode === 'password' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-dust2 bg-paper2 px-3 py-2 text-sm font-mono mb-3 outline-none focus:border-ink"
              />
            )}
            {error && (
              <p className="text-danger text-sm mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper font-mono text-xs tracking-widest uppercase py-2.5 px-4 hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Please wait…'
                : mode === 'password'
                ? 'Sign In'
                : 'Send Magic Link'}
            </button>
          </form>
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
