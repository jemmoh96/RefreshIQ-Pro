import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        base: {
          900: '#080812',
          800: '#0d0d1a',
          700: '#111120',
          600: '#161627',
          500: '#1a1a2e',
          400: '#1e1e38',
          300: '#252542',
          200: '#2d2d52',
          100: '#363660',
        },
        // Border system
        border: {
          subtle: 'rgba(255,255,255,0.04)',
          dim: 'rgba(255,255,255,0.07)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          bright: 'rgba(255,255,255,0.16)',
          focus: 'rgba(34,197,94,0.50)',
        },
        // Green accent (primary)
        green: {
          950: '#052e16',
          900: '#0a3d1f',
          800: '#14532d',
          700: '#166534',
          600: '#16a34a',
          500: '#22c55e',
          400: '#4ade80',
          300: '#86efac',
          200: '#bbf7d0',
          glow: 'rgba(34,197,94,0.15)',
          pulse: 'rgba(34,197,94,0.30)',
        },
        // Yellow accent (warnings/active)
        amber: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
          glow: 'rgba(245,158,11,0.15)',
        },
        // Blue accent (info)
        blue: {
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
          glow: 'rgba(59,130,246,0.15)',
        },
        // Red accent (errors/danger)
        red: {
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
          glow: 'rgba(239,68,68,0.15)',
        },
        // Text system
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
          dim: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.375rem', { lineHeight: '2rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        pill: '9999px',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34,197,94,0.25), 0 0 40px rgba(34,197,94,0.10)',
        'glow-green-sm': '0 0 10px rgba(34,197,94,0.20)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.25)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.25)',
        'glow-red': '0 0 20px rgba(239,68,68,0.25)',
        card: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.10)',
        inner: 'inset 0 1px 3px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-green': 'linear-gradient(135deg, #22c55e, #16a34a)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-active': 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'count-down': 'count-down linear forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.05)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
