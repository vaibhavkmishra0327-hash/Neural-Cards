/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector', // 👈 'class' ki jagah ye likho (V4 ke liye)
  theme: {
    extend: {},
  },
  plugins: [],
}