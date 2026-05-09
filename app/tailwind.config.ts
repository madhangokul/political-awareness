import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1208',
        paper: {
          DEFAULT: '#faf6ee',
          2: '#f3ede0',
          3: '#ebe3d0',
        },
        dust: {
          DEFAULT: '#d4c9b0',
          2: '#b8aa90',
        },
        muted: '#8a7d68',
        accent: '#8b3a00',
        gold: '#a07030',
        teal: {
          DEFAULT: '#1a5848',
          soft: 'rgba(26,88,72,0.08)',
        },
        danger: {
          DEFAULT: '#8b2020',
          soft: 'rgba(139,32,32,0.08)',
        },
        ink_blue: {
          DEFAULT: '#1a3868',
          soft: 'rgba(26,56,104,0.08)',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Literata', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      maxWidth: {
        article: '820px',
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
