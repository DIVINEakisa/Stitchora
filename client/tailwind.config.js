/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F3A20',
        accent: '#D4AF37',
        background: '#FAFAFA',
        card: '#F4F1EA',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(15, 58, 32, 0.08)',
        card: '0 2px 16px rgba(26, 26, 26, 0.06)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};
