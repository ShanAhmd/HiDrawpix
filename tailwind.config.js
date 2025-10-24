/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0B132B',
        'glass-overlay': 'rgba(255, 255, 255, 0.08)',
        'accent': '#00C9A7',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0BEC5',
        'error': '#FF4081',
        'amber': '#FFC107',
        'blue': '#2196F3'
      }
    },
  },
  plugins: [],
}
