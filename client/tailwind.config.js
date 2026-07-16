/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-light': '#86d5f7',
        brand: '#00a8e8',
        'brand-ink': '#0077a3',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
// Force Tailwind Rebuild (2)
