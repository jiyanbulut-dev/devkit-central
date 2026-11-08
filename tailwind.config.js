/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Developer-oriented dark palette
        ink: {
          950: '#07090d',
          900: '#0b0e14',
          800: '#10141c',
          700: '#171c27',
          600: '#1f2633',
          500: '#2a3344',
          400: '#3a4559',
        },
        accent: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
