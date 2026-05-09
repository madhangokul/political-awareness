import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // All palette colors reference CSS vars so Tailwind classes
        // automatically adapt to light / dark mode token swaps.
        ink:   'var(--ink)',
        paper: {
          DEFAULT: 'var(--paper)',
          2:       'var(--paper2)',
          3:       'var(--paper3)',
        },
        dust: {
          DEFAULT: 'var(--dust)',
          2:       'var(--dust2)',
        },
        muted:  'var(--muted)',
        accent: 'var(--accent)',
        gold:   'var(--gold)',
        teal:   'var(--teal)',
        danger: 'var(--red)',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Literata', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      maxWidth: {
        article: '1040px',
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
