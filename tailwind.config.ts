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
        background: "var(--background)",
        foreground: "var(--foreground)",
        party: {
          dark: "#08060F",
          card: "#120E1E",
          surface: "#1A142D",
          border: "#2E244B",
          neonPink: "#FF2E93",
          neonPurple: "#9333EA",
          neonCyan: "#00F0FF",
          electricViolet: "#7B2CBF",
          accentPink: "#FF007F",
          gold: "#FFD700",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "stage-lights":
          "radial-gradient(circle at 50% -20%, rgba(147, 51, 234, 0.35), transparent 70%), radial-gradient(circle at 10% 20%, rgba(255, 46, 147, 0.25), transparent 50%), radial-gradient(circle at 90% 20%, rgba(0, 240, 255, 0.2), transparent 50%)",
        "hero-glow":
          "linear-gradient(180deg, rgba(147, 51, 234, 0.15) 0%, rgba(255, 46, 147, 0.08) 50%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(147, 51, 234, 0.5)",
        "glow-pink": "0 0 25px -5px rgba(255, 46, 147, 0.5)",
        "glow-cyan": "0 0 25px -5px rgba(0, 240, 255, 0.5)",
        "glow-gold": "0 0 30px -5px rgba(255, 215, 0, 0.5)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
