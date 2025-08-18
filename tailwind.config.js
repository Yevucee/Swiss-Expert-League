/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        "swiss-red": "#DC2626",
        "swiss-dark": "#B91C1C",
        "swiss-light": "#FEF2F2",
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 3s infinite",
        firework: "firework 1s ease-out forwards",
      },
      keyframes: {
        firework: {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(0)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
