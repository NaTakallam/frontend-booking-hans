/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure it scans all React components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#800000",
        secondary: "#378A6D",
        star: "#D5A45D",
        blackInput: "#E7E7E7",
        lightGrey: "#616161",
        darkGrey: "#424242",
      },
      fontFamily: {
        fellix: ["Fellix", "sans-serif"],
      },
    },
  },
  plugins: [],
}