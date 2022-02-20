module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'mnemonic-orange': '#ff9326'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'IBM Plex Sans JP', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
