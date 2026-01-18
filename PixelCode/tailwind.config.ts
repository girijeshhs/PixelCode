import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["var(--font-pixel)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        "pixel-bg": "#0b0f1a",
        "pixel-card": "#111827",
        "pixel-accent": "#22d3ee",
        "pixel-accent-2": "#a78bfa",
        "pixel-muted": "#94a3b8"
      },
      boxShadow: {
        pixel: "0 0 0 2px #1f2937, 6px 6px 0 0 #0f172a"
      }
    }
  },
  plugins: []
};

export default config;
