import React from "react";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Button } from "react-native-paper";

import HomeScreen from "../screens/Home";
import PLPScreen from "../screens/PLP";
import PDPScreen from "../screens/PDP";
import CartScreen from "../screens/Cart";
import CheckoutScreen from "../screens/Checkout";

export type RootStackParamList = {
  Home: undefined;
  PLP: { q?: string } | undefined;
  PDP: { id: string };
  Cart: undefined;
  Checkout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Home: "",
      PLP: "plp",
      PDP: "pdp/:id",
      Cart: "cart",
      Checkout: "checkout",
    },
  },
};

export default function AppNavigation() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({
          navigation,
          route,
        }: {
          navigation: NativeStackNavigationProp<RootStackParamList>;
          route: RouteProp<RootStackParamList>;
        }) => ({
          headerRight: () => {
            if (route.name === "Cart") return null;

            return (
              <Button
                mode="text"
                compact
                onPress={() => navigation.navigate("Cart")}
                accessibilityLabel="Go to cart"
              >
                Cart
              </Button>
            );
          },
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="PLP"
          component={PLPScreen}
          options={{
            headerBackVisible: false,
            headerLeft: () => null,
            title: "Product Listing Page",
          }}
        />
        <Stack.Screen name="PDP" component={PDPScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
