import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand: deep indigo "study blue" — feels scholarly + Indian-modern
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#1e1b4b",
        },
        // Saffron / warm secondary — knowledge, energy, Indian palette
        saffron: {
          50: "#fff7ed",
          100: "#ffedd5",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        // Cream / parchment — soft page background tone
        cream: {
          50: "#fdfaf3",
          100: "#fbf5e6",
          200: "#f5ead0",
        },
        // Ink — for serious text accents
        ink: {
          700: "#27272a",
          800: "#18181b",
          900: "#0f0f12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(99,102,241,0.18), transparent 60%)",
        // Ruled-paper notebook lines for the global page background
        "notebook-lines":
          "repeating-linear-gradient(to bottom, transparent 0 31px, hsl(var(--border) / 0.35) 31px 32px)",
        // Subtle dot-grid for accent panels
        "dot-grid":
          "radial-gradient(hsl(var(--border) / 0.6) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "20px 20px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "draw-underline": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "draw-underline": "draw-underline 0.6s ease-out forwards",
      },
      boxShadow: {
        // Soft warm shadow for cards — feels like paper on a desk
        paper: "0 1px 0 0 hsl(var(--border)), 0 8px 24px -12px hsl(220 40% 8% / 0.3)",
        warm: "0 10px 30px -10px rgba(249, 115, 22, 0.25)",
      },
    },
  },
  plugins: [animate],
};

export default config;
