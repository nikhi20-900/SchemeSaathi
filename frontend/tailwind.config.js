/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#F4F5F4',
          100: '#E4E6E4',
          700: '#2A342F',
          800: '#1F2723',
          900: '#151B18',
          950: '#0E1210',
        },
        linen: {
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F4F1EC',
          300: '#EAE5DC',
          400: '#DDD6C9',
          500: '#C8BFAF',
        },
        terracotta: {
          100: '#FDEEE9',
          200: '#F9D5C9',
          500: '#C85A32',
          600: '#B04C27',
          700: '#923E1E',
        },
        sage: {
          50: '#F1F5F3',
          100: '#E1EBE5',
          200: '#C3D7CC',
          500: '#3F6152',
          600: '#324E42',
          700: '#263C33',
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',
          600: '#B45309',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
