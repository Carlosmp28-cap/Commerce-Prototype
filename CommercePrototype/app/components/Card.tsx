import type * as React from "react";
import { View, StyleSheet } from "react-native";

// Reusable Card component for product tiles, etc.
// TODO: accept thumbnail, title, price and onPress; integrate with theme tokens.
export default function Card({ children }: { children?: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { padding: 12, backgroundColor: "#fff", borderRadius: 8, margin: 8 },
});
