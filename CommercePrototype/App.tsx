import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, tokens } from "./app/themes";
import { AuthProvider } from "./app/hooks/useAuth";
import { CartProvider } from "./app/hooks/useCart";
import AppNavigation from "./app/navigation";

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokens.colors.primary,
    background: tokens.colors.background,
    surface: "#FFFFFF",
    onSurface: tokens.colors.text,
    onBackground: tokens.colors.text,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Safe area is required for correct spacing on iOS devices with a home indicator. */}
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider theme={paperTheme}>
            <AuthProvider>
              <CartProvider>
                <AppNavigation />
              </CartProvider>
            </AuthProvider>
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
