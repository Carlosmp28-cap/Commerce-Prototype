import React from "react";
import { View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import { Screen } from "../layout/Screen";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <Screen style={styles.container}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { opacity: 0.8 },
});
