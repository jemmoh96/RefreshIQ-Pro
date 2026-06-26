/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        riq: {
          bg:       '#0b0f1a',
          surface:  '#141929',
          elevated: '#1a2038',
          border:   '#252d4a',
          'border-light': '#303d66',
          green:    '#22c55e',
          'green-dim':   '#166534',
          'green-glow':  'rgba(34,197,94,0.25)',
          amber:    '#f59e0b',
          'amber-dim':   '#92400e',
          blue:     '#3b82f6',
          red:      '#ef4444',
          text:     '#e2e8ff',
          muted:    '#6b7ab8',
          subtle:   '#3d4f7c',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs:    ['11px', '15px'],
        sm:    ['12px', '16px'],
        base:  ['13px', '18px'],
        md:    ['14px', '20px'],
        lg:    ['16px', '22px'],
        xl:    ['18px', '24px'],
        '2xl': ['22px', '28px'],
        '3xl': ['28px', '34px'],
        '4xl': ['36px', '42px'],
      },
      boxShadow: {
        'glow-green': '0 0 16px rgba(34,197,94,0.35), 0 0 4px rgba(34,197,94,0.2)',
        'glow-amber': '0 0 16px rgba(245,158,11,0.35)',
        'glow-blue':  '0 0 16px rgba(59,130,246,0.3)',
        'glass':      'inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'popup':      '0 8px 32px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:  '6px',
        md:  '10px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '20px',
      },
      animation: {
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'slide-up':     'slide-up 0.18s ease-out',
        'fade-in':      'fade-in 0.15s ease-out',
        'spin-slow':    'spin 3s linear infinite',
        'ping-once':    'ping 0.6s cubic-bezier(0,0,0.2,1) 1',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%':       { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
