import React from "react";
import { Image, Platform, StyleProp, type ImageStyle } from "react-native";

type Props = {
  /** Image source (kept broad to support `expo-image` on web). */
  source: any;
  /** Alt text for web (also used as an accessibility label). */
  alt: string;
  style?: StyleProp<ImageStyle>;
  // Only set for the most important image on the page.
  priority?: "high" | "normal" | "low";
};

/**
 * Image wrapper for Home.
 * - Web: uses `expo-image` for `<img>` attributes (alt, fetchPriority)
 * - Native/tests: falls back to `react-native`'s `Image`
 */
export function HomeImage({ source, alt, style, priority }: Props) {
  // Avoid importing expo-image in Jest (ESM) by requiring it only on web.
  const WebImage: any =
    Platform.OS === "web" ? (require("expo-image") as any).Image : null;

  if (Platform.OS === "web" && WebImage) {
    return (
      <WebImage
        source={source}
        style={style}
        contentFit="cover"
        cachePolicy="disk"
        transition={0}
        // On web, expo-image sets <img alt={accessibilityLabel}>.
        // `alt` is an alias, but setting both avoids version quirks.
        accessibilityLabel={alt}
        alt={alt}
        fetchPriority={priority === "high" ? "high" : "auto"}
        loading={priority === "high" ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  // Native/test fallback.
  return <Image source={source} style={style} resizeMode="cover" />;
}
