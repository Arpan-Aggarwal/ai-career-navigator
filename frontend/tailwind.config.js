/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b9fc',
          400: '#7c94f8',
          500: '#5b6ef1',
          600: '#4550e5',
          700: '#3840ca',
          800: '#3037a3',
          900: '#2c3381',
        },
        accent: {
          cyan: '#22d3ee',
          teal: '#14b8a6',
          violet: '#8b5cf6',
          amber: '#f59e0b',
        },
        surface: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a28',
          600: '#222235',
          500: '#2d2d45',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(91,110,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(91,110,241,0.05) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(91,110,241,0.3), transparent)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(91,110,241,0.3)',
        'glow-cyan': '0 0 40px rgba(34,211,238,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(91,110,241,0.2)',
      }
    },
  },
  plugins: [],
}
