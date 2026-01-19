import React from "react";
import type { PropsWithChildren } from "react";
import { ScrollView, type StyleProp, View, type ViewStyle } from "react-native";

import { useTheme } from "../themes";
import Footer from "../components/Footer";

const DEFAULT_PADDING = 16;

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

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          // Use padding on the container for consistent “page margins”.
          padding,
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

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/*
        Make the footer behave like an SFRA web footer:
        - It scrolls naturally when content is long.
        - When content is short, it stays at the bottom of the viewport.
      */}
      <View style={{ flexGrow: 1 }}>
        <View style={[{ flexGrow: 1, padding }, contentContainerStyle]}>
          {children}
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}
