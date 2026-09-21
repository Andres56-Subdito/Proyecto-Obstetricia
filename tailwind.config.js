/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9D508D', // Extracted from screenshots
        'primary-dark': '#7A3F6C',
        'primary-light': '#B36CA1',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        display: ['Arial Black', 'Impact', 'sans-serif'], // For the bold UI titles in the hero
      }
    },
  },
  plugins: [],
}
