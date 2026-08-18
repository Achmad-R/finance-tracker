import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#18181B",
        secondary: "var(--secondary)",
        cta: "#2563EB",
        background: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        hairline: "var(--hairline)",
        positive: "#059669",
        negative: "#E11D48",
        warning: "#D97706",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.1)",
        lg: "0 10px 15px rgba(0,0,0,0.1)",
        xl: "0 20px 25px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
