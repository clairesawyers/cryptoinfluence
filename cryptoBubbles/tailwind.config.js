/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Success Colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Loss Colors
        loss: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Dark Theme Greys
        gray: {
          25: '#fcfcfc',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1f1f1f',
          900: '#171717',
          925: '#121212',
          950: '#0a0a0a',
          975: '#050505',
        },
        // Accents
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          turquoise: '#40e0d0',
          'turquoise-light': '#7fffd4',
          'turquoise-dark': '#20b2aa',
          yellow: '#eab308',
          ethereum: '#627eea',
        }
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['Silkscreen', 'Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'panel-raised': `
          4px 4px 8px rgba(0, 0, 0, 0.6),
          2px 2px 4px rgba(0, 0, 0, 0.4),
          inset -2px -2px 4px rgba(0, 0, 0, 0.3),
          inset 2px 2px 4px rgba(255, 255, 255, 0.08)
        `,
        'panel-floating': `
          8px 8px 16px rgba(0, 0, 0, 0.7),
          4px 4px 8px rgba(0, 0, 0, 0.5),
          2px 2px 4px rgba(0, 0, 0, 0.3),
          inset -2px -2px 4px rgba(0, 0, 0, 0.2),
          inset 2px 2px 4px rgba(255, 255, 255, 0.1)
        `,
        'card-intense': `
          6px 6px 12px rgba(0, 0, 0, 0.8),
          3px 3px 6px rgba(0, 0, 0, 0.6),
          1px 1px 2px rgba(0, 0, 0, 0.4),
          inset -1px -1px 3px rgba(0, 0, 0, 0.3),
          inset 1px 1px 3px rgba(255, 255, 255, 0.1)
        `
      },
      animation: {
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}