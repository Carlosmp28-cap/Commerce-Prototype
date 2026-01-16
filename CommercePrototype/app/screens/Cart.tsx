import React from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import { ScreenScroll } from "../layout/Screen";

// Cart (placeholder).
// Later this screen should connect to `useCart()` and render real cart items.

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export default function CartScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Cart</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Placeholder — connect to useCart() in the next task.
      </Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Checkout")}
        accessibilityLabel="Go to checkout"
      >
        Checkout
      </Button>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { opacity: 0.8 },
});
