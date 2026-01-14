import React from "react";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { Button } from "react-native-paper";
import { View } from "react-native";

import HomeScreen from "../screens/Home";
import PLPScreen from "../screens/PLP";
import PDPScreen from "../screens/PDP";
import CartScreen from "../screens/Cart";
import CheckoutScreen from "../screens/Checkout";
import LoginScreen from "../screens/Login";
import { useAuth } from "../hooks/useAuth";

export type RootStackParamList = {
  // Keep these params in one place so navigation remains type-safe across screens.
  Home: undefined;
  PLP: { q?: string } | undefined;
  PDP: { id: string };
  Cart: undefined;
  Checkout: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  // Enables web URL sync and deep links (e.g. /pdp/sku123) without expo-router.
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Home: "",
      PLP: "plp",
      PDP: "pdp/:id",
      Cart: "cart",
      Checkout: "checkout",
      Login: "login",
    },
  },
};

export default function AppNavigation() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          headerRight: () => {
            if (route.name === "Cart") return null;

            const showLogin = route.name === "Home";
            const loginLabel = isAuthenticated ? "Account" : "Login";

            return (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {showLogin ? (
                  <Button
                    mode="text"
                    compact
                    onPress={() => navigation.navigate("Login")}
                    accessibilityLabel="Go to login"
                  >
                    {loginLabel}
                  </Button>
                ) : null}

                <Button
                  mode="text"
                  compact
                  onPress={() => navigation.navigate("Cart")}
                  accessibilityLabel="Go to cart"
                >
                  Cart
                </Button>
              </View>
            );
          },
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PLP" component={PLPScreen} />
        <Stack.Screen name="PDP" component={PDPScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
