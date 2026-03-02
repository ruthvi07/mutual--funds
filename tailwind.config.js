/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfff8",
          100: "#d2fff0",
          500: "#00d09c",
          600: "#00b386",
          700: "#03956f"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 38, 30, 0.08)",
      }
    },
  },
  plugins: [],
};
