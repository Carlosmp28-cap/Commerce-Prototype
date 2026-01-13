import React, { createContext, useContext } from "react";

// Design tokens example: colors, typography, spacing.
export const tokens = {
  colors: {
    primary: "#007AFF",
    background: "#F2F2F7",
    text: "#111827",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
  typography: {
    body: { fontSize: 14 },
    title: { fontSize: 18, fontWeight: "600" },
  },
};

// Theme provider skeleton. Use React Context + hook useTheme() for access.
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
