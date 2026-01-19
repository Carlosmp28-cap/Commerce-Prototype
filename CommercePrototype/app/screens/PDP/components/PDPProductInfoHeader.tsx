import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, IconButton } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Product } from "../../../models/Product";

interface PDPProductInfoHeaderProps {
  product: Product;
  isDesktop?: boolean;
}

const renderStars = (rating: number = 0) =>
  Array.from({ length: 5 }, (_, i) => (
    <MaterialIcons
      key={i}
      name={i < Math.floor(rating) ? "star" : "star-outline"}
      size={14}
      color="#FFB800"
      style={{ marginRight: 2 }}
    />
  ));

export default function PDPProductInfoHeader({
  product,
  isDesktop = false,
}: PDPProductInfoHeaderProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={{ marginBottom: isDesktop ? 0 : 20 }}>
      <View style={styles.titleRow}>
        <Text
          variant="headlineSmall"
          style={isDesktop ? styles.titleDesktop : styles.titleMobile}
        >
          {product.name}
        </Text>
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          size={24}
          onPress={() => setIsFavorite(!isFavorite)}
          iconColor={isFavorite ? "#FF3B30" : "#1a1a1a"}
        />
      </View>

      {product.rating && (
        <View style={styles.rating}>
          <View style={{ flexDirection: "row" }}>{renderStars(product.rating)}</View>
          <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
        </View>
      )}

      <View style={styles.priceRow}>
        <Text style={isDesktop ? styles.priceDesktop : styles.priceMobile}>
          € {product.price.toFixed(2)}
        </Text>
        <Text
          style={[
            styles.stock,
            {
              color: product.quantityAvailable > 0 ? "#34C759" : "#FF3B30",
            },
          ]}
        >
          {product.quantityAvailable > 0 ? "In stock" : "Out of stock"}
        </Text>
      </View>

      {product.description && (
        <Text style={styles.description}>{product.description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: -12,
  },
  titleMobile: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    color: "#0f172a",
  },
  titleDesktop: {
    fontSize: 38,
    fontWeight: "800",
    flex: 1,
    color: "#0f172a",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  reviewCount: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  priceMobile: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  priceDesktop: {
    fontSize: 38,
    fontWeight: "800",
    color: "#0f172a",
  },
  stock: {
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#F2F7F3",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
});
