/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b5d5ff",
          300: "#86b5ff",
          400: "#548dff",
          500: "#2b60ff",
          600: "#1d48db",
          700: "#1535af",
          800: "#102886",
          900: "#0f236d"
        }
      }
    }
  },
  plugins: []
};
