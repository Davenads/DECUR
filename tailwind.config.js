/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // You can customize your color palette here based on DECUR branding
        primary: {
          light: '#4a7eaa',
          DEFAULT: '#2e5c8a',
          dark: '#1e3f62',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};