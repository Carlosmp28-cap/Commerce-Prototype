import React from "react";
import {
  NavigationContainer,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

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

export const HOME_TITLE = "Commerce Prototype";

export function HeaderHomeButton({
  navigation,
}: {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    popToTop?: () => void;
  };
}) {
  const paperTheme = useTheme();
  const textColor = paperTheme.colors.onSurface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go to Home"
      onPress={() => {
        // If the stack has Home as the first route (it does), this reliably returns there.
        if (typeof navigation.popToTop === "function") {
          navigation.popToTop();
          return;
        }
        navigation.navigate("Home");
      }}
      hitSlop={10}
      style={({ pressed }) => [
        styles.headerHomeButton,
        pressed ? styles.headerHomeButtonPressed : null,
      ]}
    >
      <Text style={[styles.headerHomeButtonText, { color: textColor }]}>
        {HOME_TITLE}
      </Text>
    </Pressable>
  );
}

export const linkingConfig: LinkingOptions<RootStackParamList> = {
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

export function HeaderActions({
  navigation,
  routeName,
}: {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
  };
  routeName: keyof RootStackParamList;
}) {
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

      {routeName === "Cart" ? null : (
        <IconButton
          icon="cart"
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Cart"
        />
      )}
    </View>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerTitle: () => (
            <HeaderHomeButton navigation={navigation as any} />
          ),
          headerRight: () => {
            return (
              <HeaderActions
                navigation={navigation as any}
                routeName={route.name as keyof RootStackParamList}
              />
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

const styles = StyleSheet.create({
  headerHomeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
  },
  headerHomeButtonPressed: {
    opacity: 0.6,
  },
  headerHomeButtonText: {
    fontWeight: "700",
  },
});
