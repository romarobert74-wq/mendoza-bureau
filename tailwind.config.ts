import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff3ee',
          100: '#ffe0d3',
          400: '#ff9366',
          500: '#ff7a45',
          600: '#f15a24',
          700: '#d8461a',
          900: '#7a2811',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        surface: {
          900: '#080c18',
          800: '#0d1225',
          700: '#111827',
          600: '#1a2235',
          500: '#1e293b',
          400: '#263045',
        },
      },
    },
  },
  plugins: [],
}

export default config
