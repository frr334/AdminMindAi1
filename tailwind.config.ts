import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#E8F2F4",
          100: "#C5DCE2",
          200: "#8FB8C3",
          300: "#58919F",
          400: "#2F6F80",
          500: "#0B3D4A",
          600: "#093440",
          700: "#072A34",
          800: "#051F27",
          900: "#03151B",
        },
        gold: {
          50: "#FBF4E8",
          100: "#F5E4C4",
          200: "#E8C888",
          300: "#E8A54B",
          400: "#D48B2A",
          500: "#B8731C",
        },
        study: {
          50: "#F3F0FA",
          100: "#E2DBF2",
          200: "#C4B6E3",
          300: "#8B74C4",
          400: "#5B4B8A",
          500: "#433567",
        },
        paper: "#F7F4EF",
        mist: "#EEF3F4",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 61, 74, 0.06), 0 12px 32px rgba(11, 61, 74, 0.08)",
        soft: "0 8px 24px rgba(11, 61, 74, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
