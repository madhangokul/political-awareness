import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)  // true once Supabase confirms recovery session
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase processes the #access_token fragment on load and fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    // Sign out then redirect to home after a beat
    await supabase.auth.signOut()
    setTimeout(() => navigate('/'), 2500)
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--paper)',
        border: '2px solid var(--ink)',
        padding: '40px 32px',
        maxWidth: 380,
        width: '100%',
      }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: 20,
        }}>
          Set New Password
        </span>

        {done ? (
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 12 }}>
              Password updated
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--muted)' }}>
              You'll be redirected to the home page shortly. Please sign in with your new password.
            </p>
          </div>
        ) : !ready ? (
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 20 }}>
              Waiting for reset link to be verified…
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
              If this page doesn't respond, your reset link may have expired.{' '}
              <a href="/" style={{ color: 'var(--accent)' }}>Go home</a>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                border: '1px solid var(--dust2)',
                background: 'var(--paper-2)',
                padding: '8px 12px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid var(--dust2)',
                background: 'var(--paper-2)',
                padding: '8px 12px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                marginBottom: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '10px 16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Updating…' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
