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
        // You can customize your dark mode colors here
        dark: {
          DEFAULT: '#1a1b1e',
          100: '#1a1b1e',
          200: '#2c2e33',
          300: '#3d4147',
          400: '#4e535c',
          500: '#5f6571',
          600: '#707786',
          700: '#828a9b',
          800: '#939db0',
          900: '#a4b0c5',
        },
      },
    },
  },
  plugins: [],
}
