import React from "react";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { View } from "react-native";
import { IconButton } from "react-native-paper";

import HomeScreen from "../screens/Home";
import PLPScreen from "../screens/PLP";
import PDPScreen from "../screens/PDP";
import CartScreen from "../screens/Cart";
import CheckoutScreen from "../screens/Checkout";
import LoginScreen from "../screens/Login";

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
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          headerRight: () => {
            return (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  icon="magnify"
                  onPress={() => navigation.navigate("PLP")}
                  accessibilityLabel="Search"
                />

                <IconButton
                  icon="account"
                  onPress={() => navigation.navigate("Login")}
                  accessibilityLabel="Account"
                />

                {route.name === "Cart" ? null : (
                  <IconButton
                    icon="cart"
                    onPress={() => navigation.navigate("Cart")}
                    accessibilityLabel="Cart"
                  />
                )}
              </View>
            );
          },
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Commerce Prototype" }}
        />
        <Stack.Screen name="PLP" component={PLPScreen} />
        <Stack.Screen name="PDP" component={PDPScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
