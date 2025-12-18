import type { Config } from 'tailwindcss';

export default {
  content: [
    './docs/**/*.{html,js}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;