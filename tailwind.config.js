/** @type {import('tailwindcss').Config} */
export default {
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2F6B45',
        'accent': '#E07A2F',
        'secondary': '#D4A94F',
        'light': '#F5F5F5',
        'dark': '#333333',
        // Optional dark variants for hovers
        'primary-dark': '#245235',
        'accent-dark': '#C06625',
      }
    },
  },
  plugins: [],
}

