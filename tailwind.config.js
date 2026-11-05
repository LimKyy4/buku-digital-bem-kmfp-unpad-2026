/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,js,html}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'Syne', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        unbounded: ['Unbounded', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        handwritten: ['Fredoka', 'Mali', 'cursive', 'sans-serif'],
        fredoka: ['Fredoka', 'cursive', 'sans-serif'],
        mali: ['Mali', 'cursive', 'sans-serif'],
      },
      colors: {
        dream: {
          canvas: '#FFF0F5',
          dark: '#2D232E',
          pink: '#FFB7B2',
          peach: '#FFDAC1',
          mint: '#E2F0CB',
          yellow: '#FFF5BA',
          lavender: '#E8D7F5',
          blue: '#C7CEEA',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #2D232E',
        'neo': '3px 3px 0px #2D232E',
        'neo-lg': '4px 4px 0px #2D232E',
        'neo-5': '5px 5px 0px 0px #2D232E',
        'neo-xl': '6px 6px 0px #2D232E',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
        '4': '4px',
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
    },
  },
  plugins: [],
};
