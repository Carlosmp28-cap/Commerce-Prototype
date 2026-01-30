import type * as React from "react";
import { render } from "@testing-library/react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";

import { AuthProvider } from "../app/hooks/useAuth";
import { ThemeProvider } from "../app/themes";
// wrap tests with the app CartProvider so useCart works
import { CartProvider } from "../app/store/CartContext";

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider>
          <CartProvider>
            <NavigationContainer>{ui}</NavigationContainer>
          </CartProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>,
  );
}

export * from "@testing-library/react-native";
export default renderWithProviders;
