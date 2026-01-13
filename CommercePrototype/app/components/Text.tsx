import React from "react";
import { Text as RNText, TextProps } from "react-native";

// Base Text wrapper to apply typography tokens via theme.
// TODO: use useTheme() to map variants to styles.
export default function AppText(
  props: TextProps & { variant?: "body" | "title" }
) {
  return <RNText {...props} />;
}
