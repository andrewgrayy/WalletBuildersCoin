/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: '#050505',
        foreground: '#EDEDED',
        card: {
          DEFAULT: '#0A0A0A',
          foreground: '#EDEDED'
        },
        popover: {
          DEFAULT: '#0A0A0A',
          foreground: '#EDEDED'
        },
        primary: {
          DEFAULT: '#00F0FF',
          foreground: '#000000'
        },
        secondary: {
          DEFAULT: '#7000FF',
          foreground: '#FFFFFF'
        },
        muted: {
          DEFAULT: '#1F1F1F',
          foreground: '#888888'
        },
        accent: {
          DEFAULT: '#1F1F1F',
          foreground: '#EDEDED'
        },
        destructive: {
          DEFAULT: '#FF003C',
          foreground: '#FFFFFF'
        },
        border: '#1F1F1F',
        input: '#1F1F1F',
        ring: '#00F0FF'
      },
      fontFamily: {
        heading: ['Unbounded', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.7s ease-out',
        'slide-in': 'slide-in 0.5s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}