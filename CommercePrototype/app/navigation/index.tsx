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
import { IconButton, Text, useTheme } from "react-native-paper";

import { useAuth } from "../hooks/useAuth";
import HomeScreen from "../screens/Home";

export type RootStackParamList = {
  // Keep these params in one place so navigation remains type-safe across screens.
  Home: undefined;
  PLP: { q?: string } | undefined;
  PDP: { id: string };
  Cart: undefined;
  // pass items from Cart to Checkout
  Checkout: { items?: { id: string; title: string; qty: number; price: number }[] } | undefined;
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
  const { width } = useWindowDimensions();
  const textColor = paperTheme.colors.onSurface;

  // Native headers center the title independently of the right actions.
  // Constrain width on small screens so the title never overlaps headerRight icons.
  const isNative = Platform.OS !== "web";
  // Most phones end up truncating "Commerce Prototype" to "Commerce Proto…".
  // Prefer a stacked 2-line title on native/mobile sizes to avoid ellipsis.
  const useTwoLineTitle = isNative && width < 500;
  const maxTitleWidth = isNative ? Math.max(140, width - 200) : undefined;
  const fontSize =
    Platform.OS === "web" ? 16 : useTwoLineTitle ? (width < 380 ? 12 : 13) : 15;
  const lineHeight = Math.round(fontSize * 1.15);

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
        useTwoLineTitle ? { paddingVertical: 2 } : null,
        maxTitleWidth ? { maxWidth: maxTitleWidth } : null,
        pressed ? styles.headerHomeButtonPressed : null,
      ]}
    >
      {useTwoLineTitle ? (
        <View style={styles.headerHomeButtonTextStack}>
          <Text
            numberOfLines={1}
            style={[
              styles.headerHomeButtonText,
              {
                color: textColor,
                fontSize,
                lineHeight,
              },
            ]}
          >
            Commerce
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.headerHomeButtonText,
              {
                color: textColor,
                fontSize,
                lineHeight,
              },
            ]}
          >
            Prototype
          </Text>
        </View>
      ) : (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.headerHomeButtonText,
            { color: textColor, fontSize, lineHeight },
          ]}
        >
          {HOME_TITLE}
        </Text>
      )}
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
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== "web";
  const isCompact = isNative && width < 390;
  const iconSize = isNative ? (isCompact ? 20 : 22) : 24;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <IconButton
        icon="magnify"
        size={iconSize}
        onPress={() => navigation.navigate("PLP")}
        accessibilityLabel="Search"
      />

      <IconButton
        icon="account"
        size={iconSize}
        onPress={() => navigation.navigate("Login")}
        accessibilityLabel="Account"
      />

      {routeName === "Cart" ? null : (
        <IconButton
          icon="cart"
          size={iconSize}
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Cart"
        />
      )}
    </View>
  );
}

export default function AppNavigation() {
  const { isAuthenticated } = useAuth();

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
          getComponent={() => require("../screens/Cart").default}
        />
        <Stack.Screen
          name="Checkout"
          getComponent={() => require("../screens/Checkout/Checkout").default}
        />
        <Stack.Screen
          name="Login"
          getComponent={() => require("../screens/Login").default}
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
