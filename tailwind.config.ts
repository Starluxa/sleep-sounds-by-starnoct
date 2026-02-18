import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './src/**/*.{js,ts,jsx,tsx,mdx,css}',
    './{tailwind,postcss}.config.{js,ts}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "nebula-drift": {
          "0%": { transform: "translate(0, 0) rotate(0deg)" },
          "100%": { transform: "translate(50px, 30px) rotate(360deg)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(var(--glow-primary) / 0.5), 0 0 20px hsl(var(--glow-primary) / 0.3)"
          },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--glow-primary) / 0.8), 0 0 40px hsl(var(--glow-primary) / 0.5)"
          },
        },
        "subtle-glow": {
          "0%, 100%": { opacity: "0.7", boxShadow: "0 0 5px hsl(var(--glow-primary) / 0.3)" },
          "50%": { opacity: "1", boxShadow: "0 0 10px hsl(var(--glow-primary) / 0.4)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-1px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(1px)" },
        },
        "calm-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(192, 132, 252, 0.3)" },
          "50%": { borderColor: "rgba(192, 132, 252, 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        twinkle: "twinkle 3s ease-in-out infinite",
        "twinkle-slow": "twinkle 5s ease-in-out infinite",
        "twinkle-fast": "twinkle 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "nebula-drift": "nebula-drift 60s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "glow-pulse-slow": "glow-pulse 4s ease-in-out infinite",
        "subtle-glow": "subtle-glow 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        shake: "shake 0.5s ease-in-out infinite",
        "calm-glow": "calm-glow 8s ease-in-out infinite",
        "border-glow": "border-glow 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;