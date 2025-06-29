/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'warm-orange': '#ff6b35',
        'warm-yellow': '#ffa500',
        'warm-red': '#ff4757',
        'soft-cream': '#fef7f0',
        'gentle-gray': '#f8f9fa',
        'fire': {
          'weak': '#ffa500',
          'medium': '#ff6b35',
          'strong': '#ff4757'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'fire-flicker': 'flicker 0.5s ease-in-out infinite alternate',
        'encouragement-bounce': 'bounce 1s infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.8' }
        }
      }
    },
  },
  plugins: [],
}