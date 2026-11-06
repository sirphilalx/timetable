/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#818CF8",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0F172A",
          cardLight: "#FFFFFF",
          cardDark: "#1E293B",
        },
        status: {
          soon: "#F59E0B",
          attended: "#16A34A",
          overdue: "#DC2626",
        },
        course: {
          blue: "#2563EB",
          teal: "#0D9488",
          purple: "#7C3AED",
          pink: "#DB2777",
          orange: "#EA580C",
          cyan: "#0891B2",
          yellow: "#A16207",
          slate: "#475569",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
