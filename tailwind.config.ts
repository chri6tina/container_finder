import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#fecad5',
          300: '#fba2b4',
          400: '#f06f89',
          500: '#e24a6a',
          600: '#c93254',
          700: '#a92547',
          800: '#8a2040',
          900: '#731d38'
        }
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0,0,0,0.12)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
} satisfies Config;


