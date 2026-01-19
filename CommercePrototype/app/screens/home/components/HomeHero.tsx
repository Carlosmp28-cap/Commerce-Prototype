import React from "react";
import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { HomeImage } from "./HomeImage";

export function HomeHero({
  heroImage,
  onShopAll,
  onShopSale,
}: {
  heroImage: any;
  onShopAll: () => void;
  onShopSale: () => void;
}) {
  const paperTheme = usePaperTheme();

  const imageSource =
    heroImage ?? require("../../../../assets/images/react-logo.png");

  const heroContent = (
    <>
      <View style={styles.heroOverlay} />
      <Card.Content style={styles.heroContent}>
        <Text style={styles.heroKicker}>Welcome</Text>
        <Text variant="headlineSmall" style={styles.heroHeadline}>
          New season essentials
        </Text>
        <Text style={styles.heroBody}>
          Shop curated picks across New, Men, Women and Sale.
        </Text>

        <View style={styles.heroCtas}>
          <Button
            mode="contained"
            onPress={onShopAll}
            accessibilityLabel="Shop all products"
            style={styles.heroCtaButton}
          >
            Shop all
          </Button>
          <Button
            mode="outlined"
            onPress={onShopSale}
            accessibilityLabel="Shop sale"
            style={styles.heroCtaButton}
          >
            Shop sale
          </Button>
        </View>
      </Card.Content>
    </>
  );

  return (
    <Card
      style={[styles.heroCard, { backgroundColor: paperTheme.colors.surface }]}
      onPress={onShopAll}
      accessibilityLabel="Open product listing"
    >
      <View style={styles.heroClip}>
        {Platform.OS === "web" ? (
          <View style={styles.heroImageBg}>
            <HomeImage
              source={imageSource}
              alt="New season essentials"
              priority="high"
              style={styles.heroImage}
            />
            {heroContent}
          </View>
        ) : (
          <ImageBackground
            source={imageSource}
            style={styles.heroImageBg}
            imageStyle={styles.heroImageBgImage}
          >
            {heroContent}
          </ImageBackground>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
  },
  heroClip: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImageBg: {
    minHeight: 190,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.05 }],
  },
  heroImageBgImage: {
    transform: [{ scale: 1.05 }],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  heroContent: {
    paddingTop: 18,
    paddingBottom: 16,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
  },
  heroHeadline: {
    marginTop: 6,
    color: "#fff",
    fontWeight: "900",
  },
  heroBody: {
    marginTop: 6,
    color: "rgba(255,255,255,0.9)",
    opacity: 0.95,
  },
  heroCtas: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  heroCtaButton: {
    // On narrow screens, avoid shrinking (which causes Paper's label to ellipsize).
    // With flexWrap enabled on the container, this will wrap buttons onto the next line instead.
    flexShrink: 0,
  },
});
