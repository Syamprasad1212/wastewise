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
        forest: {
          50: '#f0f9f1',
          100: '#dcf2e0',
          200: '#bbe5c3',
          300: '#8dd19b',
          400: '#5ab66e',
          500: '#389a4d',
          600: '#2a7c3c',
          700: '#236332',
          800: '#1f4f2a',
          900: '#1a4124',
          950: '#0b2312',
        },
        village: {
          wet: '#16a34a',      // Green bin for organic / wet waste
          dry: '#2563eb',      // Blue bin for dry / recyclable waste
          hazard: '#dc2626',   // Red bin for hazardous waste
          sanitary: '#ca8a04', // Yellow bin for sanitary waste
          earth: '#854d0e',    // Brown for compost
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
