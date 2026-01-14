import React from "react";
import { View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Checkout (placeholder)
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Next step: forms, shipping, payment.
      </Text>

      <Button
        mode="contained"
        onPress={() => navigation.goBack()}
        accessibilityLabel="Back"
      >
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { opacity: 0.8 },
});
