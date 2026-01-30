import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, tokens } from "./app/themes";
import { AuthProvider } from "./app/hooks/useAuth";
import { CartProvider } from "./app/hooks/useCart";
import { useViewportMeta } from "./app/hooks/useViewportMeta";
import AppNavigation from "./app/navigation";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: tokens.colors.primary,
    background: tokens.colors.background,
    surface: tokens.colors.surface,
    onSurface: tokens.colors.text,
    onBackground: tokens.colors.text,
    outline: tokens.colors.border,
  },
};

export default Sentry.wrap(function App() {
  useViewportMeta();

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
});
