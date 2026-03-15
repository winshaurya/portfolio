export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "text-primary": "hsl(var(--text) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        stroke: "hsl(var(--stroke) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'marquee': 'marquee 40s linear infinite',
        'scroll': 'scroll 30s linear infinite',
        'scroll-reverse': 'scroll-reverse 30s linear infinite',
        'scroll-down': 'scroll-down 1.5s ease-in-out infinite',
        'role-fade-in': 'role-fade-in 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}