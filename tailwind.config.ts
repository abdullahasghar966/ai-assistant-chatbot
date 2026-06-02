import type { Config } from "tailwindcss";

/**
 * Design tokens are the single source of truth in `src/styles/tokens.css`.
 * This config only *maps* those CSS variables into Tailwind's theme so that
 * component code stays free of raw hex values (non-negotiable #3).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        app: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          dark: "var(--color-surface-dark)",
        },
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          active: "var(--color-sidebar-active)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
          softer: "var(--color-accent-softer)",
        },
        ink: {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
          sidebar: "var(--color-text-sidebar)",
        },
        line: {
          DEFAULT: "var(--color-border)",
          medium: "var(--color-border-medium)",
          input: "var(--color-border-input)",
        },
        chart: {
          primary: "var(--color-chart-primary)",
          secondary: "var(--color-chart-secondary)",
          track: "var(--color-chart-track)",
          "bar-active": "var(--color-chart-bar-active)",
          "bar-muted": "var(--color-chart-bar-muted)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        sidebar: "var(--shadow-sidebar)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
      fontSize: {
        display: ["42px", { lineHeight: "1.15", fontWeight: "800", letterSpacing: "-0.02em" }],
        h1: ["28px", { lineHeight: "1.25", fontWeight: "700", letterSpacing: "-0.01em" }],
        h2: ["20px", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.005em" }],
        h3: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
        "metric-lg": ["32px", { lineHeight: "1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "metric-md": ["22px", { lineHeight: "1", fontWeight: "700", letterSpacing: "-0.02em" }],
        "metric-sm": ["16px", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.02em" }],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        shimmer: "shimmer 1.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
