import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#050816',
        },
        brand: {
          50: '#eef8ff',
          100: '#d9f0ff',
          200: '#bce4ff',
          300: '#8dd4ff',
          400: '#57beff',
          500: '#2ca3ff',
          600: '#167dff',
          700: '#155fe6',
          800: '#194db8',
          900: '#1a438f',
        },
        cyanAccent: '#58f4ff',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(22, 125, 255, 0.22)',
        panel: '0 24px 60px rgba(5, 8, 22, 0.45)',
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top, rgba(88,244,255,0.14), transparent 28%), linear-gradient(120deg, rgba(22,125,255,0.15), rgba(88,244,255,0.06))',
      },
    },
  },
  plugins: [],
};

export default config;
