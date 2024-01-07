import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        blue: {
          100: 'rgb(214, 232, 241)',
          200: 'rgb(173, 216, 230)',
          300: 'rgb(132, 200, 219)',
          400: 'rgb(91, 184, 208)',
          500: 'rgb(50, 168, 197)',
          600: 'rgb(25, 152, 186)',
          700: 'rgb(0, 136, 175)',
          800: 'rgb(0, 120, 164)',
          900: 'rgb(25, 25, 112)',
        },
      },
    },
  },
  plugins: [],
};
export default config;
