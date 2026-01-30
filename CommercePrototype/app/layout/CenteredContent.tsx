import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

/**
 * Centers content and constrains max width for responsive web/tablet layouts.
 *
 * On mobile, content stays full-width (up to the device width).
 * On wide screens (web), this prevents forms/cards from stretching too far.
 */
export function CenteredContent({
  children,
  maxWidth = 520,
  style,
  contentStyle,
}: PropsWithChildren<{
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>) {
  return (
    <View style={[styles.outer, style]}>
      <View style={[styles.inner, { maxWidth }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    alignSelf: "center",
  },
});
