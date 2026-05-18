import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        orange: "var(--color-orange)",
        orangeSoft: "var(--color-orange-soft)",
        green: "var(--color-green)",
        blue: "var(--color-blue)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(22, 20, 18, 0.10)",
        card: "0 8px 24px rgba(22, 20, 18, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
