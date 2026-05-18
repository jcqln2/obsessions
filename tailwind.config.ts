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
        canvas: "#f8f7f5",
        ink: "#2a2a2a",
        muted: "#999999",
        timeline: "#333333",
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
