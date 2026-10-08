import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#050404',
          2: '#0a0908',
          3: '#111010',
        },
        gold: {
          DEFAULT: '#C9A84C',
          dim: '#8a6e2a',
          bright: '#e8c96a',
        },
        crimson: '#C0392B',
        pale: '#c4c0bb',
        white: '#f5f3f0',
        fog: '#4a4744',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Crimson Pro', 'serif'],
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
