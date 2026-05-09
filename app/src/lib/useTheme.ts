import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  // Keep browser chrome in sync (address bar colour on mobile)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0c09' : '#faf6ee')
}

/**
 * Global theme hook. Safe to call from multiple components —
 * state lives in the DOM + localStorage, not in React tree.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Apply on every change
  useEffect(() => { applyTheme(theme) }, [theme])

  // Re-sync if OS preference changes while light/dark hasn't been saved
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    setThemeState(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  return { theme, isDark: theme === 'dark', toggle }
}
