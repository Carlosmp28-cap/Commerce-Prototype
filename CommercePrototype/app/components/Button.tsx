import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

// Base Button component
// TODO: connect to theme tokens (colors, spacing) and add accessibility props.
export default function ButtonBase({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.btn}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 12, backgroundColor: "#007AFF", borderRadius: 6 },
  label: { color: "#fff", textAlign: "center" },
});
