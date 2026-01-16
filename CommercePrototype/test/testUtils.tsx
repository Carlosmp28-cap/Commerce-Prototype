import React from "react";
import { render } from "@testing-library/react-native";
import { Provider as PaperProvider, Text } from "react-native-paper";

import { AuthProvider } from "../app/hooks/useAuth";
import { ThemeProvider } from "../app/themes";

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider
          settings={{
            // Avoid Paper trying to resolve native icon packs in Jest.
            icon: () => <Text accessibilityLabel="icon">icon</Text>,
          }}
        >
          {ui}
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
