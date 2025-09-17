/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'telegram-bg': 'var(--tg-theme-bg-color, #18222d)',
        'telegram-text': 'var(--tg-theme-text-color, #ffffff)',
        'telegram-hint': 'var(--tg-theme-hint-color, #b1c3d5)',
        'telegram-button': 'var(--tg-theme-button-color, #2481cc)',
        'telegram-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
        'telegram-secondary-bg': 'var(--tg-theme-secondary-bg-color, #1f2d3a)',
      }
    }
  },
  plugins: [],
}
