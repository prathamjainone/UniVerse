/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        neon: {
          blue: '#00F0FF',
          purple: '#7000FF',
          teal: '#00F0A0'
        },
        dark: {
          bg: '#050505',
          card: '#0a0a0a'
        }
      }
    },
  },
  plugins: [],
}
