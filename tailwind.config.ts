import type { Config } from "tailwindcss";
import rtl from "tailwindcss-rtl";

const config: Config = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "9999px",
        "2xl": "16px",
        xl: "12px",
        lg: "10px",
      },
      boxShadow: {
        "blue-glow": "0 0 20px rgba(69,109,255,0.4)",
        "gold-glow": "0 0 20px rgba(247,195,37,0.4)",
        card: "0 2px 8px rgba(0,0,0,0.4)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.6)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.85)" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
        pulseBlue: {
          "0%": { boxShadow: "0 0 0 0 rgba(69,109,255,0.6)" },
          "100%": { boxShadow: "0 0 0 16px rgba(69,109,255,0)" },
        },
        floatXP: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-70px) scale(1.3)" },
        },
        loaderAnim: {
          "0%": { inset: "0 35px 35px 0" },
          "12.5%": { inset: "0 35px 0 0" },
          "25%": { inset: "35px 35px 0 0" },
          "37.5%": { inset: "35px 0 0 0" },
          "50%": { inset: "35px 0 0 35px" },
          "62.5%": { inset: "0 0 0 35px" },
          "75%": { inset: "0 0 35px 35px" },
          "87.5%": { inset: "0 0 35px 0" },
          "100%": { inset: "0 35px 35px 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        pop: "pop 0.2s ease-out",
        shake: "shake 0.4s ease-in-out",
        "pulse-blue": "pulseBlue 0.6s ease-out",
        "float-xp": "floatXP 1.2s ease-out forwards",
        "loader-anim": "loaderAnim 2.5s infinite",
        "loader-anim-delay": "loaderAnim 2.5s infinite -1.25s",
      },
      colors: {
        brill: {
          900: "#000000",
          800: "#141414",
          700: "#1E1E1E",
          600: "#2A2A2A",
          500: "#383838",
          400: "#4A4A4A",
        },
        blue: {
          DEFAULT: "#456DFF",
          dark: "#2A4AE8",
          check: "#3860BE",
          light: "#88C9F7",
          bg: "rgba(69,109,255,0.15)",
          bgDark: "rgba(69,109,255,0.08)",
          row: "rgba(69,109,255,0.20)",
        },
        gold: {
          DEFAULT: "#F7C325",
          light: "#FFD85C",
          dark: "#C49B10",
          bg: "rgba(247,195,37,0.15)",
        },
        wrong: {
          DEFAULT: "#FF5D5D",
          bg: "rgba(255,93,93,0.15)",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#999999",
          muted: "#666666",
          disabled: "#444444",
        },
        border: {
          subtle: "rgba(255,255,255,0.08)",
          DEFAULT: "rgba(255,255,255,0.12)",
          strong: "rgba(255,255,255,0.20)",
          blue: "rgba(69,109,255,0.40)",
        },
        accent: "var(--gold)",
        success: "#456DFF",
        error: "#FF5D5D",
        warning: "#F59E0B",
        background: "var(--background)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        "card-foreground": "var(--text-primary)",
        "muted-foreground": "var(--text-muted)",
        "primary-foreground": "#ffffff",
        primary: {
          DEFAULT: "#456DFF",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--surface2)",
          foreground: "var(--text-muted)",
        },
      },
    },
  },
  plugins: [rtl],
};

export default config;
