/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Segoe UI', 'Trebuchet MS', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fff8e1',
          100: '#ffedb3',
          200: '#ffe080',
          300: '#ffd24d',
          400: '#ffc61f',
          500: '#fdc800',
          600: '#e0ad00',
          700: '#b38900',
          800: '#856700',
          900: '#5c4700',
        },
        // GI-KACE header/footer red.
        brand: {
          50: '#fbe9e9',
          100: '#f5c9c9',
          200: '#ea9797',
          300: '#df6565',
          400: '#d84545',
          500: '#cf2e2e',
          600: '#cf2e2e',
          700: '#b52424',
          800: '#8f1c1c',
          900: '#6b1515',
        },
      },
    },
  },
  plugins: [],
}

