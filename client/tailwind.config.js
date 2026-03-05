/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#0B0F19",
        bgSurface: "#111827",
        bgElevated: "#1A2238",

        aiBlue: "#4F7CFF",
        aiCyan: "#22D3EE",

        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F43F5E",

        textPrimary: "#E5E7EB",
        textSecondary: "#9CA3AF",
        fontVariantNumeric: ['tabular-nums'],
      }
    },
  },
  plugins: [],
}
