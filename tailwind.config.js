/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dota-bg': '#0e1015',
        'dota-card': '#1a1d24',
        'dota-border': '#2a2d35',
        'dota-accent': '#3b82f6',
        'radiant': '#92A525',
        'dire': '#C23C2A',
        'win': '#22c55e',
        'loss': '#ef4444',
        'gold': '#F5A623',
      },
    },
  },
  plugins: [],
}
