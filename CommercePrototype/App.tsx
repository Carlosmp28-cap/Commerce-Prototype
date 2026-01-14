import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, tokens } from "./app/themes";
import { AuthProvider } from "./app/hooks/useAuth";
import { CartProvider } from "./app/hooks/useCart";
import AppNavigation from "./app/navigation";
import Footer from "./app/components/Footer";

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
      {/* Safe area is required for correct footer spacing on iOS devices with a home indicator. */}
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider theme={paperTheme}>
            <AuthProvider>
              <CartProvider>
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <AppNavigation />
                  </View>
                  {/* Render once globally. Screens use `Screen`/`ScreenScroll` to avoid overlap. */}
                  <Footer />
                </View>
              </CartProvider>
            </AuthProvider>
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
