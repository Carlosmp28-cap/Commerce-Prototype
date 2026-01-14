import React, { useMemo } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Chip, Text } from "react-native-paper";

import { useTheme } from "../themes";
import type { RootStackParamList } from "../navigation";
import { categories, getFeaturedProducts } from "../data/catalog";
import { ScreenScroll } from "../layout/Screen";

// Home (landing) screen.
// Uses `ScreenScroll` so content gets footer-aware bottom padding automatically.

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();

  const featuredProducts = useMemo(() => getFeaturedProducts(), []);

  return (
    <ScreenScroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            Commerce Prototype
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.colors.text }]}>
            SFRA-style prototype in React Native (React Navigation)
          </Text>

          <Button
            onPress={() => navigation.navigate("PLP")}
            mode="contained"
            style={styles.primaryCta}
            contentStyle={{ paddingVertical: 6 }}
            accessibilityLabel="Browse products"
          >
            Browse products
          </Button>
        </View>

        <Image
          source={require("../../assets/images/react-logo.png")}
          style={styles.heroImage}
          resizeMode="contain"
          accessibilityLabel="Illustration image"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Categories
        </Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              onPress={() => navigation.navigate("PLP", { q: c.query })}
              style={styles.chip}
              accessibilityLabel={`Open category ${c.label}`}
            >
              {c.label}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Featured
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => navigation.navigate("PLP")}
            accessibilityLabel="See all products"
          >
            See all
          </Button>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featuredProducts}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.navigate("PDP", { id: item.id })}
              style={styles.productCard}
              accessibilityLabel={`Open product ${item.name}`}
            >
              <Card.Cover source={item.image} style={styles.productImage} />
              <Card.Content style={{ paddingTop: 10 }}>
                <Text variant="titleMedium" style={{ fontWeight: "900" }}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>
                  € {item.price.toFixed(2)}
                </Text>
                <Text style={{ marginTop: 2, opacity: 0.7 }}>
                  {item.quantityAvailable > 0
                    ? `${item.quantityAvailable} in stock`
                    : "Out of stock"}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Quick actions
        </Text>

        <View style={styles.quickActions}>
          <Card
            onPress={() => navigation.navigate("Cart")}
            style={styles.quickAction}
            accessibilityLabel="Go to cart"
          >
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: "900" }}>
                Cart
              </Text>
              <Text style={styles.quickActionSubtitle}>
                View items and continue
              </Text>
            </Card.Content>
          </Card>

          <Card
            onPress={() => navigation.navigate("PLP")}
            style={styles.quickAction}
            accessibilityLabel="Go to product listing"
          >
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: "900" }}>
                PLP
              </Text>
              <Text style={styles.quickActionSubtitle}>Product listing</Text>
            </Card.Content>
          </Card>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  content: {},
  hero: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: "900", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, opacity: 0.8, marginBottom: 12 },
  heroImage: { width: 72, height: 72 },
  primaryCta: { borderRadius: 10, alignSelf: "flex-start" },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "rgba(255,255,255,0.85)" },
  carousel: { gap: 12, paddingVertical: 4 },
  productCard: {
    width: 160,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  productImage: {
    height: 90,
    borderRadius: 10,
  },
  productPrice: { marginTop: 4, fontWeight: "900", color: "#007AFF" },
  quickActions: { flexDirection: "row", gap: 12 },
  quickAction: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  quickActionSubtitle: { marginTop: 4, opacity: 0.7 },
});
