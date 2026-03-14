/**
 * Design System Tokens
 * Core design tokens for NeuroHolistic brand
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: "#f8f6ff",
    100: "#f0ebff",
    200: "#e4d7ff",
    300: "#ceb6ff",
    400: "#a678ff",
    500: "#8B7CF7", // Brand primary
    600: "#7656db",
    700: "#6342c0",
    800: "#5337a0",
    900: "#422d75",
    950: "#2a1c4e",
  },

  // Secondary Brand Colors (Emerald - Balance, Growth)
  secondary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  // Neutral Colors
  neutral: {
    0: "#ffffff",
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Accent Colors
  accent: {
    blue: "#0891b2",
    orange: "#f97316",
    rose: "#e11d48",
    amber: "#f59e0b",
  },

  // Semantic Colors
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Gradients
  gradients: {
    heroMain: "linear-gradient(135deg, #8B7CF7 0%, #6342c0 100%)",
    heroDark: "linear-gradient(135deg, #2a1c4e 0%, #111827 100%)",
    ethereal: "linear-gradient(135deg, #8B7CF7 0%, #22c55e 100%)",
    sunset: "linear-gradient(135deg, #f97316 0%, #e11d48 100%)",
  },
};

export const typography = {
  // Font families
  fonts: {
    sans: "system-ui, -apple-system, sans-serif",
    serif: "ui-serif, Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, monospace",
  },

  // Font sizes
  sizes: {
    xs: { size: "12px", lineHeight: "16px" },
    sm: { size: "14px", lineHeight: "20px" },
    base: { size: "16px", lineHeight: "24px" },
    lg: { size: "18px", lineHeight: "28px" },
    xl: { size: "20px", lineHeight: "28px" },
    "2xl": { size: "24px", lineHeight: "32px" },
    "3xl": { size: "30px", lineHeight: "36px" },
    "4xl": { size: "36px", lineHeight: "40px" },
    "5xl": { size: "48px", lineHeight: "52px" },
  },

  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Text styles
  styles: {
    display: {
      size: "48px",
      lineHeight: "1.1",
      weight: 700,
      letterSpacing: "-0.02em",
    },
    h1: {
      size: "36px",
      lineHeight: "1.2",
      weight: 600,
      letterSpacing: "-0.015em",
    },
    h2: {
      size: "28px",
      lineHeight: "1.3",
      weight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      size: "24px",
      lineHeight: "1.3",
      weight: 600,
    },
    h4: {
      size: "20px",
      lineHeight: "1.4",
      weight: 600,
    },
    body: {
      size: "16px",
      lineHeight: "1.6",
      weight: 400,
    },
    label: {
      size: "14px",
      lineHeight: "1.5",
      weight: 500,
    },
    caption: {
      size: "12px",
      lineHeight: "1.5",
      weight: 400,
    },
  },
};

export const spacing = {
  // Spacing scale (8px base)
  0: "0",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
};

export const borders = {
  radius: {
    none: "0",
    sm: "4px",
    base: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    full: "9999px",
  },

  width: {
    thin: "1px",
    base: "2px",
    thick: "4px",
  },
};

export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  elevated: "0 20px 40px -10px rgba(139, 124, 247, 0.2)",
  "glow-purple": "0 0 20px rgba(139, 124, 247, 0.4)",
  "glow-success": "0 0 20px rgba(34, 197, 94, 0.4)",
};

export const transitions = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  slower: "500ms",

  timing: {
    linear: "linear",
    ease: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export const layout = {
  maxWidth: "1440px",
  containerPadding: {
    mobile: "16px",
    tablet: "24px",
    desktop: "32px",
  },
  headerHeight: "80px",
  footerHeight: "400px",
};

export const animation = {
  durations: {
    fastest: "100ms",
    faster: "150ms",
    fast: "200ms",
    normal: "300ms",
    slow: "500ms",
    slower: "700ms",
  },
};
