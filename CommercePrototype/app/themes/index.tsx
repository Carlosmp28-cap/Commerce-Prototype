import React, { createContext, useContext } from "react";

/**
 * Design tokens (prototype).
 *
 * These tokens are our “source of truth” for spacing/typography/colors.
 * React Native Paper is also themed from these tokens in App.tsx.
 */
export const tokens = {
  colors: {
    primary: "#275790",
    background: "#F2F2F7",
    text: "#111827",

    // Surfaces & borders
    surface: "#FFFFFF",
    border: "#E5E7EB",
    placeholder: "#E5E5EA",

    // Text hierarchy
    mutedText: "#4B5563",
    subtleText: "#6B7280",

    // Status
    success: "#045919",
    danger: "#ff1c1c",
    warning: "#FFB800",
    successBackground: "#F2F7F3",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    body: { fontSize: 14 },
    title: { fontSize: 18, fontWeight: "600" },
  },
};

// Theme provider skeleton. Screens use `useTheme()` for token access.
const ThemeContext = createContext(tokens);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// TODO: expand to support dark mode, runtime switching, and typed tokens.
