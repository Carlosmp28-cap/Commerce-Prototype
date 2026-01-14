import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import type { Product } from "../models/Product";
import { getProductById } from "../data/catalog";

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const theme = useTheme();
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
            {product.quantityAvailable > 0
              ? `${product.quantityAvailable} in stock`
              : "Out of stock"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  sku: { opacity: 0.7 },
  price: { fontSize: 16, fontWeight: "900", color: "#007AFF" },
});
