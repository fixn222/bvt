import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        party: {
          bg: "#130924",
          dark: "#130924",
          surface: "#1E1238",
          card: "#2A1B4E",
          cardHover: "#352264",
          border: "#4C3382",
          yellow: "#FFE600",
          pink: "#FF2E93",
          neonPink: "#FF2E93",
          purple: "#9333EA",
          violet: "#7C3AED",
          cyan: "#00F0FF",
          orange: "#FF6B00",
          lime: "#22C55E",
          cream: "#FFF9E6",
        },
      },
      boxShadow: {
        cartoon: "4px 4px 0px 0px #000000",
        "cartoon-sm": "2px 2px 0px 0px #000000",
        "cartoon-lg": "6px 6px 0px 0px #000000",
        "cartoon-xl": "8px 8px 0px 0px #000000",
        "cartoon-pink": "4px 4px 0px 0px #FF2E93",
        "cartoon-yellow": "4px 4px 0px 0px #FFE600",
        "cartoon-cyan": "4px 4px 0px 0px #00F0FF",
        "cartoon-white": "4px 4px 0px 0px #FFFFFF",
      },
      keyframes: {
        wobble: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        popIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        wobble: "wobble 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "pop-in": "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
