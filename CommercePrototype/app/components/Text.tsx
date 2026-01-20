import React, { useMemo } from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";

import { useTheme } from "../themes";

type Variant = "body" | "title";

export default function AppText({ variant = "body", style, ...rest }: TextProps & { variant?: Variant }) {
  const theme = useTheme();

  const baseStyle = useMemo<TextStyle>(() => {
    const variantStyle =
      variant === "title"
        ? (theme.typography.title as TextStyle)
        : (theme.typography.body as TextStyle);

    return {
      ...variantStyle,
      color: theme.colors.text,
    };
  }, [theme, variant]);

  return <RNText {...rest} style={[baseStyle, style]} />;
}
