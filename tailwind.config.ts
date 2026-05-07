import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FDF6EF",
        foreground: "#2C1A0E",
        cream: "#FDF6EF",
        muted: "#F0E4D7",
        terracotta: {
          DEFAULT: "#C9856A",
          dark: "#A6614A",
          light: "#E8B49A",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        dancing: ["var(--font-dancing)", "cursive"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
