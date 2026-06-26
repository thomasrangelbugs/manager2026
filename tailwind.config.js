/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Rajdhani', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(35, 211, 141, 0.22)',
        gold: '0 0 36px rgba(245, 190, 84, 0.2)',
      },
      colors: {
        turf: '#23d38d',
        gold: '#f5be54',
        storm: '#0b1220',
        ink: '#101726',
      },
    },
  },
  plugins: [],
};
