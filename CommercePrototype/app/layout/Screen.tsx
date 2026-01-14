import React from "react";
import type { PropsWithChildren } from "react";
import { ScrollView, type StyleProp, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../themes";
import { FOOTER_BASE_HEIGHT } from "../components/Footer";

const DEFAULT_PADDING = 16;

export function useFooterAwareBottomPadding(extra: number = DEFAULT_PADDING) {
  const insets = useSafeAreaInsets();
  return extra + FOOTER_BASE_HEIGHT + insets.bottom;
}

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padding?: number;
}>;

export function Screen({
  children,
  style,
  padding = DEFAULT_PADDING,
}: ScreenProps) {
  const theme = useTheme();
  const paddingBottom = useFooterAwareBottomPadding(padding);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding,
          paddingBottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ScreenScrollProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padding?: number;
}>;

export function ScreenScroll({
  children,
  style,
  contentContainerStyle,
  padding = DEFAULT_PADDING,
}: ScreenScrollProps) {
  const theme = useTheme();
  const paddingBottom = useFooterAwareBottomPadding(padding);

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={[
        { padding, paddingBottom },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}
