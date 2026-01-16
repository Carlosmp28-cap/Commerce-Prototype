import React from "react";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useTheme } from "../themes/index";

/**
 * Small wrapper around Paper's Button.
 *
 * Why this exists:
 * - lets us map our design tokens (spacing/typography/colors) into a consistent
 *   button style without repeating styling logic everywhere.
 *
 * In the future, we may prefer relying on Paper's theme variants instead of
 * passing custom colors here.
 */

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  variantType?: "primary" | "secondary" | "danger";
  mode?: "contained" | "outlined" | "text";
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  size = "medium",
  variantType = "primary",
  mode = "contained",
  disabled = false,
}: CustomButtonProps) {
  const theme = useTheme();

  const sizeStyles = {
    small: { paddingVertical: theme.spacing.xs, fontSize: 12 },
    medium: { paddingVertical: theme.spacing.sm, fontSize: theme.typography.body.fontSize },
    large: { paddingVertical: theme.spacing.md, fontSize: theme.typography.title.fontSize },
  };

  const variantColors = {
    primary: theme.colors.primary,
    // TODO: move these into `tokens.colors` once we standardize the palette.
    secondary: "#6B7280",
    danger: "#DC2626",
  };

  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: mode === "contained" ? variantColors[variantType] : "transparent" },
        { paddingVertical: sizeStyles[size].paddingVertical },
      ]}
      labelStyle={{
        fontSize: sizeStyles[size].fontSize,
        color: mode === "contained" ? "#fff" : variantColors[variantType],
      }}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
});
