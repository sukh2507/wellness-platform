/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class", // enables dark mode via a 'dark' class
  theme: {
    extend: {
      colors: {
        background: "#000000",
        neonBlue: "#00ffff",
      },
      boxShadow: {
        neon: "0 0 10px #00ffff, 0 0 20px #00ffff",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
    },
  },
  plugins: [],
};
