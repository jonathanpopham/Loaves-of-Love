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
        // Loaves of Love brand palette
        brand: {
          50: '#fef3e2',
          100: '#fde6c4',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
        },
        'lol-red': '#8B1A1A',
        'lol-gold': '#C9A83C',
        'lol-cream': '#FAF6F0',
      },
    },
  },
  plugins: [],
}

export default config
