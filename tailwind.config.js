/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple-inspired accent colors
        accent: {
          DEFAULT: '#FF2D55',
          dark: '#D91A42',
          light: '#FF6B8A',
        },
        // Semantic colors
        income: {
          DEFAULT: '#34C759',
          dark: '#28A745',
          light: '#86EFAC',
        },
        expense: {
          DEFAULT: '#FF3B30',
          dark: '#DC2626',
          light: '#FCA5A5',
        },
        // Surface colors for glassmorphism
        surface: {
          light: 'rgba(255, 255, 255, 0.92)',
          dark: 'rgba(30, 30, 30, 0.92)',
        },
        // Background gradients
        gradient: {
          start: 'rgba(255, 200, 210, 0.4)',
          mid: 'rgba(255, 255, 255, 0.95)',
          end: 'rgba(230, 230, 250, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(255, 45, 85, 0.3)',
        'glow-green': '0 0 20px rgba(52, 199, 89, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-bottom': 'slideInBottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'progress': 'progress 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
