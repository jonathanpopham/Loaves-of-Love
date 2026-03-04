import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lol-red": "#8B1A1A",
        "lol-gold": "#C9A83C",
        "lol-cream": "#FAF6F0",
      },
    },
  },
  plugins: [],
};
export default config;
