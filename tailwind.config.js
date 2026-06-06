/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          violet: '#7c3aed',
          indigo: '#4f46e5',
        },
        score: {
          exact:  '#10b981', // emerald-500 — marcador exacto
          winner: '#f59e0b', // amber-500  — ganador/empate
          fail:   '#ef4444', // red-500    — fallo
          none:   '#94a3b8', // slate-400  — sin calcular
        },
        status: {
          scheduled: '#3b82f6', // blue-500
          finished:  '#10b981', // emerald-500
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-card':    'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-hero':    'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #fdf4ff 100%)',
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'glow':    '0 0 20px rgb(79 70 229 / 0.15)',
        'glass':   '0 8px 32px 0 rgb(31 38 135 / 0.08)',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'slide-down':  'slideDown 0.2s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'spin-slow':   'spin 3s linear infinite',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'toast-in':    'toastIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1)',
        'toast-out':   'toastOut 0.2s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateX(100%) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        toastOut: {
          '0%':   { opacity: '1', transform: 'translateX(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(100%) scale(0.9)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};
