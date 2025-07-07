export default {
  plugins: {
    '@tailwindcss/postcss': {
      content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
    },
    autoprefixer: {},
  },
}
