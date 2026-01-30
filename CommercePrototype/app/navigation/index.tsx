import * as React from "react";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { useAuth } from "../hooks/useAuth";
import { useCategories, getMainCategories } from "../hooks/useCategories";
import HomeScreen from "../screens/Home";
import AppHeader from "./AppHeader";
import { HeaderActions, HeaderHomeButton } from "./HeaderParts";

// Re-export header parts for backwards compatibility (tests and other modules)
export { HeaderActions, HeaderHomeButton };
export type RootStackParamList = {
  // Keep these params in one place so navigation remains type-safe across screens.
  Home: undefined;
  PLP: { q?: string } | undefined;
  PDP: { id: string };
  Cart: undefined;
  Checkout: { totalTax?: number } | undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const HOME_TITLE = "Commerce Prototype";

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  // Enables web URL sync and deep links (e.g. /pdp/sku123) without expo-router.
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Home: "home",
      PLP: "plp",
      PDP: "pdp/:id",
      Cart: "cart",
      Checkout: "checkout",
      Login: "login",
    },
  },
};

// HeaderHomeButton and HeaderActions are provided by HeaderParts to avoid require cycles

export default function AppNavigation() {
  const { isAuthenticated } = useAuth();
  const { categories: categoryTree } = useCategories("root", 3);

  const mainCategories = getMainCategories(categoryTree);

  // Web: if user hits root `/`, replace URL to `/home` so the app URL is consistent
  // with the routing config and mirrors expected deep-linking behaviour.
  React.useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const pathname = window.location.pathname || "/";
        if (pathname === "/") {
          window.history.replaceState(null, "", "/home");
        }
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          header: (props) => (
            <AppHeader {...props} mainCategories={mainCategories} />
          ),
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="PLP"
          getComponent={() => require("../screens/PLP").default}
          options={{
            headerBackVisible: false,
            headerLeft: () => null,
            title: "Product Listing Page",
          }}
        />
        <Stack.Screen
          name="PDP"
          getComponent={() => require("../screens/PDP").default}
        />
        <Stack.Screen
          name="Cart"
          getComponent={() => require("../screens/Cart/Cart").default}
        />
        <Stack.Screen
          name="Checkout"
          getComponent={() => require("../screens/Checkout/Checkout").default}
        />
        <Stack.Screen
          name="Login"
          getComponent={() => require("../screens/Login").default}
        />
        <Stack.Screen
          name="Register"
          getComponent={() => require("../screens/Register").default}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerHomeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 1,
  },
  headerHomeButtonPressed: {
    opacity: 0.6,
  },
  headerHomeButtonTextStack: {
    alignItems: "center",
  },
  headerHomeButtonText: {
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },
});
