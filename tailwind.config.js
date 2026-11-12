/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Architectural Design System
        canvas: '#F4F6FA',
        surface: '#FFFFFF',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#1E3A5F',
          950: '#172554'
        },
        navy: {
          800: '#111827',
          850: '#0f172a',
          900: '#0a0f1d',
          950: '#060913'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif']
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      },
      borderColor: {
        DEFAULT: '#E5E7EB',
        subtle: '#E5E7EB',
        muted: '#F3F4F6',
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
      },
      animation: {
        'mode-slide': 'modeSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'sidebar-in': 'sidebarIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        modeSlide: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sidebarIn: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
