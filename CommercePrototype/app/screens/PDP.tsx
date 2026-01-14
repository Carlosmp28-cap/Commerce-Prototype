import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import type { Product } from "../models/Product";
import { getProductById } from "../data/catalog";
import { Screen } from "../layout/Screen";
import { getAvailabilityLabel } from "../utils/stock";

// PDP (Product Details Page).
// Note: we avoid TSX generic call syntax like `useMemo<Product>(...)` here because
// Metro can mis-parse it in some setups; a return type annotation is safer.

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const { id } = route.params;

  const product = useMemo((): Product => {
    return (
      getProductById(id) ?? {
        id,
        name: `Product ${id}`,
        price: 39.99,
        quantityAvailable: 0,
        categoryId: "new",
      }
    );
  }, [id]);

  return (
    <Screen style={styles.container}>
      <Card>
        {product.image ? (
          <Card.Cover source={product.image} style={styles.image} />
        ) : null}

        <Card.Content style={{ paddingTop: 12 }}>
          <Text variant="titleLarge" style={{ fontWeight: "900" }}>
            {product.name}
          </Text>
          <Text style={styles.sku}>SKU: {product.id}</Text>
          <Text style={styles.price}>€ {product.price.toFixed(2)}</Text>
          <Text style={{ opacity: 0.75 }}>
            {getAvailabilityLabel(product.quantityAvailable)}
          </Text>
        </Card.Content>

        <Card.Actions style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Cart")}
            accessibilityLabel="Go to cart"
          >
            Go to cart
          </Button>
        </Card.Actions>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  sku: { opacity: 0.7 },
  price: { fontSize: 16, fontWeight: "900", color: "#007AFF" },
});
