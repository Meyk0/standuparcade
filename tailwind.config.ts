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
        "skin-bg": "var(--skin-bg)",
        "skin-bg-secondary": "var(--skin-bg-secondary)",
        "skin-text": "var(--skin-text)",
        "skin-text-secondary": "var(--skin-text-secondary)",
        "skin-accent": "var(--skin-accent)",
        "skin-accent-secondary": "var(--skin-accent-secondary)",
        "skin-border": "var(--skin-border)",
        "skin-reel-bg": "var(--skin-reel-bg)",
        "skin-button-bg": "var(--skin-button-bg)",
        "skin-button-text": "var(--skin-button-text)",
        "skin-button-hover": "var(--skin-button-hover)",
        "skin-danger": "var(--skin-danger)",
        "skin-muted": "var(--skin-muted)",
      },
      fontFamily: {
        skin: ["var(--skin-font)"],
      },
    },
  },
  plugins: [],
};
export default config;
