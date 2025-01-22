/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'modal-open': {
          '0%': { transform: 'translateY(100%)' }, // Start from the bottom
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'modal-open': 'modal-open 0.5s ease-out',
      }
    },
  },
  plugins: [
    // require('tailwind-scrollbar-hide')
  ],
}

