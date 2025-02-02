/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ollama-primary': '#4A90E2',
        'ollama-secondary': '#5DADE2'
      }
    },
  },
  plugins: [],
}

