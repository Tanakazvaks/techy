/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        techy: {
          bg: "#0a0e1a",
          surface: "#121826",
          border: "#1f2937",
          text: "#e5e7eb",
          muted: "#9ca3af",
          accent: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
