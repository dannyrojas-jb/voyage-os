import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1b2a',
        water: '#12324f',
        teal: '#0e7c86',
        tealbright: '#14b8a6',
        sand: '#f6f4ef',
        amber: '#d98324',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
