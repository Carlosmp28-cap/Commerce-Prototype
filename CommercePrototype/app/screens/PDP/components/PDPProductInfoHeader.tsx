import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, IconButton, Button } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Product } from "../../../models/Product";
import { useTheme } from "../../../themes";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation";
import { useIsTablet } from "@/app/hooks/useIsTablet";
type RootNav = NativeStackNavigationProp<RootStackParamList>;

interface PDPProductInfoHeaderProps {
  product: Product;
  isDesktop?: boolean;
}

const renderStars = (rating: number = 0, color: string) =>
  Array.from({ length: 5 }, (_, i) => (
    <MaterialIcons
      key={i}
      name={i < Math.floor(rating) ? "star" : "star-outline"}
      size={14}
      color={color}
      style={{ marginRight: 2 }}
    />
  ));

export default function PDPProductInfoHeader({
  product,
  isDesktop = false,
}: PDPProductInfoHeaderProps) {
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation<RootNav>();
  const isTablet = useIsTablet();

  const showLocateButton =
    isDesktop || Platform.OS === "web" || isTablet === true;

  return (
    <View style={{ marginBottom: isDesktop ? 0 : 20 }}>
      <View style={styles.titleRow}>
        <Text
          variant="headlineSmall"
          style={[
            isDesktop ? styles.titleDesktop : styles.titleMobile,
            { color: theme.colors.text },
          ]}
        >
          {product.name}
        </Text>
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          size={24}
          onPress={() => setIsFavorite(!isFavorite)}
          iconColor={isFavorite ? theme.colors.danger : theme.colors.text}
        />
      </View>

      {product.rating && (
        <View style={styles.rating}>
          <View style={{ flexDirection: "row" }}>
            {renderStars(product.rating, theme.colors.warning)}
          </View>
          <Text style={[styles.reviewCount, { color: theme.colors.text }]}>
            ({product.reviewCount || 0})
          </Text>
        </View>
      )}

      <View style={styles.priceRow}>
        <Text
          style={[
            isDesktop ? styles.priceDesktop : styles.priceMobile,
            { color: theme.colors.primary },
          ]}
        >
          € {product.price.toFixed(2)}
        </Text>
        <Text
          style={[
            styles.stock,
            {
              color:
                product.quantityAvailable > 0
                  ? theme.colors.success
                  : theme.colors.danger,
              backgroundColor: theme.colors.successBackground,
            },
          ]}
        >
          {product.quantityAvailable > 0 ? "In stock" : "Out of stock"}
        </Text>
      </View>

      {showLocateButton && (
        <View style={styles.priceRow}>
          <Button
            mode="contained"
            onPress={() =>
              navigation.navigate("StoreMap", { storeId: product.id })
            }
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.surface }]}
          >
            Locate Product
          </Button>
        </View>
      )}

      {product.description && (
        <Text style={[styles.description, { color: theme.colors.mutedText }]}>
          {product.description}
        </Text>
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
  },
  titleDesktop: {
    fontSize: 38,
    fontWeight: "800",
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  reviewCount: {
    fontSize: 13,
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
  },
  priceDesktop: {
    fontSize: 38,
    fontWeight: "800",
  },
  stock: {
    fontSize: 13,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
});
