export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': 'var(--primary)',
        'sand-beige': 'var(--secondary)',
        'dusty-blue': 'var(--accent)',
        'olive-gray': 'var(--neutral)',
        'light-ash': 'var(--background)',
        'dark-brown': 'var(--text)',
        'coral-heart': 'var(--heart)',
        // Aliases pour compatibilité
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        text: 'var(--text)',
        heart: 'var(--heart)',
        neutral: 'var(--neutral)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
