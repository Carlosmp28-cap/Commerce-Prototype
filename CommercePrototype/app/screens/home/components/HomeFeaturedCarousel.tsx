import React from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { HomeImage } from "./HomeImage";

import { getAvailabilityLabel } from "../../../utils/stock";

export type HomeFeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image: any;
  quantityAvailable: number;
};

export function HomeFeaturedCarousel({
  title,
  products,
  onSeeAll,
  onOpenProduct,
}: {
  title: string;
  products: HomeFeaturedProduct[];
  onSeeAll: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Button
          mode="text"
          compact
          onPress={onSeeAll}
          accessibilityLabel="See all products"
        >
          See all
        </Button>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.carousel}
        renderItem={({ item }) => (
          <Card
            onPress={() => onOpenProduct(item.id)}
            style={[
              styles.productCard,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            accessibilityLabel={`Open product ${item.name}`}
          >
            {Platform.OS === "web" ? (
              <HomeImage
                source={item.image}
                alt={item.name}
                style={styles.productImage}
              />
            ) : (
              <Card.Cover source={item.image} style={styles.productImage} />
            )}
            <Card.Content style={{ paddingTop: 10 }}>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "900" }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.productPrice,
                  { color: paperTheme.colors.primary },
                ]}
              >
                € {item.price.toFixed(2)}
              </Text>
              <Text style={{ marginTop: 2, opacity: 0.7 }}>
                {getAvailabilityLabel(item.quantityAvailable)}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  carousel: { gap: 12, paddingVertical: 4 },
  productCard: {
    width: 180,
    borderRadius: 14,
  },
  productImage: {
    height: 110,
    borderRadius: 10,
  },
  productPrice: { marginTop: 6, fontWeight: "900" },
});
