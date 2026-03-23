import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm teal primary palette
        primary: {
          50: '#f0faf8',
          100: '#d4f1ec',
          200: '#a9e3d9',
          300: '#74cfc1',
          400: '#47b5a5',
          500: '#2d9a89',
          600: '#237b6e',
          700: '#1f6259',
          800: '#1c4f48',
          900: '#19413c',
          950: '#0a2724',
        },
        // Warm coral accent
        accent: {
          50: '#fef4f0',
          100: '#fde6dc',
          200: '#fbc9b8',
          300: '#f7a488',
          400: '#f27856',
          500: '#eb5a34',
          600: '#dc4020',
          700: '#b6311a',
          800: '#922b1c',
          900: '#77271c',
          950: '#40100b',
        },
        // Golden highlight
        golden: {
          50: '#fdf9ef',
          100: '#f9efd0',
          200: '#f2dc9f',
          300: '#ebc56a',
          400: '#e5af42',
          500: '#dc952b',
          600: '#c27421',
          700: '#a1561e',
          800: '#84441f',
          900: '#6d391c',
          950: '#3c1c0c',
        },
        // Warm backgrounds
        sand: {
          50: '#faf9f7',
          100: '#f3f1ec',
          200: '#e8e4db',
          300: '#d6cfc2',
          400: '#c2b7a5',
          500: '#b0a08a',
          600: '#a08e76',
          700: '#857563',
          800: '#6d6053',
          900: '#5a5046',
          950: '#2f2a24',
        },
        // Category colors for 12 dimensions
        dimension: {
          values: '#2d9a89',
          communication: '#3b82f6',
          financial: '#eab308',
          family: '#f97316',
          goals: '#8b5cf6',
          intimacy: '#ec4899',
          household: '#14b8a6',
          health: '#22c55e',
          social: '#06b6d4',
          growth: '#a855f7',
          worklife: '#6366f1',
          aesthetic: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
