import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

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

  return (
    <Card
      style={[styles.heroCard, { backgroundColor: paperTheme.colors.surface }]}
      onPress={onShopAll}
      accessibilityLabel="Open product listing"
    >
      <ImageBackground
        source={heroImage}
        style={styles.heroImageBg}
        imageStyle={styles.heroImageBgImage}
      >
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
            >
              Shop all
            </Button>
            <Button
              mode="outlined"
              onPress={onShopSale}
              accessibilityLabel="Shop sale"
            >
              Shop sale
            </Button>
          </View>
        </Card.Content>
      </ImageBackground>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImageBg: {
    minHeight: 190,
    justifyContent: "flex-end",
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
});
