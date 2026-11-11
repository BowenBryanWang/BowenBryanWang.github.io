import typographyPlugin from '@tailwindcss/typography'
import { type Config } from 'tailwindcss'

import typographyStyles from './typography'

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  plugins: [typographyPlugin],
  theme: {
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.5rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '3.5rem' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    extend: {
      // cua-gym design tokens — used only inside the
      // /blog/introducing-cua-gym page (scoped via .cua-gym-scope)
      colors: {
        paper: {
          DEFAULT: '#FDFBF5',
          deep: '#F7F3EA',
        },
        ink: {
          DEFAULT: '#1B1816',
          soft: '#5C5550',
          faint: '#9C948A',
        },
        oxblood: {
          DEFAULT: '#862D1A',
          dark: '#641F0F',
        },
        forest: '#1F6E3F',
        rule: '#E2DDD2',
      },
      fontFamily: {
        display: ['var(--font-serif)'],
        body: ['var(--font-serif)'],
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      maxWidth: {
        prose2: '52rem',
        page: '78rem',
      },
    },
    typography: typographyStyles,
  },
} satisfies Config
