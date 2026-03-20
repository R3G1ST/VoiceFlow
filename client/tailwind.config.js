/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#313338',
          200: '#2b2d31',
          300: '#1e1f22',
          400: '#1a1b1e',
          500: '#5865F2',
          600: '#4752C4',
        },
        secondary: {
          100: '#b9bbbe',
          200: '#96989d',
          300: '#72767d',
          400: '#4f545c',
          500: '#2f3136',
          600: '#202225',
        },
        success: '#23a559',
        danger: '#da373c',
        warning: '#f0b232',
      },
    },
  },
  plugins: [],
}
