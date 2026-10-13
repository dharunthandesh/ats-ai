/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a15bfe',
          500: '#7922ff',
          600: '#5200ff', // Signature NexHire Electric Violet
          700: '#4300d1',
          800: '#3400a4',
          900: '#26007b',
          950: '#140049',
        },
        indigo: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a15bfe',
          500: '#7922ff',
          600: '#5200ff', // Signature NexHire Electric Violet
          700: '#4300d1',
          800: '#3400a4',
          900: '#26007b',
          950: '#140049',
        },
        purple: {
          50: '#fbf9ff',
          100: '#f3eeff',
          200: '#e8dcff',
          300: '#d7c1ff',
          400: '#b48aff',
          500: '#8e4eff',
          600: '#5200ff',
          700: '#4300d1',
          800: '#3400a4',
          900: '#26007b',
        },
        slate: {
          850: '#111322',
          900: '#0b0d18',
          950: '#06070e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'nexhire': '0 10px 30px -5px rgba(82, 0, 255, 0.35)',
        'nexhire-sm': '0 4px 14px 0 rgba(82, 0, 255, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
