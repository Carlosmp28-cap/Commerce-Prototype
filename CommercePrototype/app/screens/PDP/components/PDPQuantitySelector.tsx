import React, { useState, useRef } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button, Menu } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Product } from "../../../models/Product";
import { useTheme } from "../../../themes";

interface PDPQuantitySelectorProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export default function PDPQuantitySelector({
  product,
  onAddToCart,
}: PDPQuantitySelectorProps) {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const anchorRef = useRef(null);

  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  if (product.quantityAvailable === 0 && !hasVariants) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(quantity);
      setIsAdding(false);
      alert(`${quantity}x ${product.name} added to cart!`);
      setQuantity(1);
    }, 300);
  };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.wrapper}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Quantity</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                ref={anchorRef}
                accessibilityRole="button"
                accessibilityLabel="Select quantity"
                style={[
                  styles.selector,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={[styles.text, { color: theme.colors.text }]}>{quantity}</Text>
                <MaterialIcons name="expand-more" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          >
            {Array.from(
              { length: Math.min(product.quantityAvailable > 0 ? product.quantityAvailable : 10, 10) },
              (_, i) => i + 1
            ).map((num) => (
              <Menu.Item
                key={num}
                onPress={() => {
                  setQuantity(num);
                  setMenuVisible(false);
                }}
                title={`${num}`}
              />
            ))}
          </Menu>
        </View>

        <Button
          mode="contained"
          onPress={handleAddToCart}
          disabled={isAdding}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={[styles.buttonLabel, { color: theme.colors.surface }]}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </View>

      {product.shipping && (
        <View
          style={[
            styles.shipping,
            {
              backgroundColor: theme.colors.background,
              borderLeftColor: theme.colors.primary,
            },
          ]}
        >
          <MaterialIcons name="local-shipping" size={16} color={theme.colors.mutedText} />
          <Text style={[styles.shippingText, { color: theme.colors.mutedText }]}>
            {product.shipping.shippingType || "Standard shipping"} •{" "}
            {product.shipping.estimatedDays || "3-5 days"}
          </Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    alignItems: "flex-end",
  },
  wrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
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
  shipping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  shippingText: {
    fontSize: 14,
    flex: 1,
    fontWeight: "600",
  },
});
