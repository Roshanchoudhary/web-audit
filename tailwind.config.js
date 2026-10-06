/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Central brand palette — adjust here to re-skin the whole product.
        brand: {
          50: '#effdf8',
          100: '#c8f9ec',
          200: '#96f1de',
          300: '#5ce2cc',
          400: '#2bcab5',
          500: '#0fb19f',
          600: '#078f81',
          700: '#097268',
          800: '#0c5a53',
          900: '#0d4a45',
          950: '#012c29',
        },
        paper: '#f7f6f2',
        ink: {
          950: '#0a1614',
          900: '#0f211e',
          800: '#16302c',
          700: '#1e423d',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Noto Sans',
          'Noto Sans Devanagari',
          'Nirmala UI',
          'Noto Sans Arabic',
          'Arial',
          'sans-serif',
        ],
        display: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans Devanagari',
          'Nirmala UI',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 22, 20, 0.04), 0 8px 24px -12px rgba(10, 22, 20, 0.18)',
        lift: '0 2px 4px rgba(10, 22, 20, 0.05), 0 24px 48px -24px rgba(10, 22, 20, 0.35)',
        glow: '0 0 0 4px rgba(15, 177, 159, 0.15)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        shimmer: 'shimmer 1.4s linear infinite',
        'spin-slow': 'spin-slow 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};
