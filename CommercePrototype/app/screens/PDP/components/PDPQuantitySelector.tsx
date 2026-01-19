import React, { useState, useRef } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button, Menu } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Product } from "../../../models/Product";

interface PDPQuantitySelectorProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export default function PDPQuantitySelector({
  product,
  onAddToCart,
}: PDPQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const anchorRef = useRef(null);

  if (product.quantityAvailable === 0) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(quantity);
      setIsAdding(false);
      alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
      setQuantity(1);
    }, 300);
  };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.wrapper}>
          <Text style={styles.label}>Quantity</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                ref={anchorRef}
                style={styles.selector}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={styles.text}>{quantity}</Text>
                <MaterialIcons name="expand-more" size={20} color="#007AFF" />
              </TouchableOpacity>
            }
          >
            {Array.from(
              { length: Math.min(product.quantityAvailable, 10) },
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
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </View>

      {product.shipping && (
        <View style={styles.shipping}>
          <MaterialIcons name="local-shipping" size={16} color="#666" />
          <Text style={styles.shippingText}>
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
    color: "#4b5563",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  button: {
    flex: 2,
    borderRadius: 10,
    backgroundColor: "#000",
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  shipping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#000",
    marginBottom: 20,
  },
  shippingText: {
    fontSize: 14,
    color: "#2d3748",
    flex: 1,
    fontWeight: "600",
  },
});
