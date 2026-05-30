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
        canvas: {
          DEFAULT: "#eeedea",
          deep: "#d5d3cc",
          highlight: "#f6f6f4",
          shadow: "#b8b6b0",
        },
        ink: "#2a2a2a",
        muted: "#7c7a76",
        timeline: "#3a3a38",
        blush: {
          50: "#FFFAFC",
          100: "#FDF4F7",
          200: "#F9DCE8",
          300: "#F4C0D1",
          400: "#ED93B1",
          500: "#C470A0",
          600: "#B85A8A",
          700: "#993556",
        },
      },
      fontFamily: {
        brand: ["var(--font-brand)", "var(--font-serif)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        scrap: "0 8px 16px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
