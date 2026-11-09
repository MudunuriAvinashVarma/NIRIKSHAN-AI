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
        background: "#0B0D0C",
        foreground: "#F5F3ED",
        brand: {
          bg: "#0B0D0C",
          surface: "#121512",
          card: "#191D19",
          cardHover: "#222722",
          border: "#262C26",
          borderLight: "#353D35",
          text: "#F5F3ED",
          muted: "#92968E",
          gold: "#C99A55",
          goldLight: "#E2B873",
          goldDark: "#946E35",
          warning: "#E9A23B",
          critical: "#E45D52",
          success: "#65B88A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        goldGlow: "0 0 25px -5px rgba(201, 154, 85, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
