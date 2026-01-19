/**
 * Example: Full Add to Cart implementation for the PDP
 * This file demonstrates how to use the addItem function in a PDP component
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Text,
  Chip,
  useTheme,
  Portal,
  Dialog,
} from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCart } from "../../hooks/useCart";
import type { Product } from "../../models/Product";

interface AddToCartExampleProps {
  product: Product;
  onSuccess?: () => void;
}

/**
 * Component that demonstrates Add to Cart integration
 */
export default function AddToCartExample({
  product,
  onSuccess,
}: AddToCartExampleProps) {
  const theme = useTheme();
  const { addItem, totalQuantity, totalPrice, items } = useCart();

  // Local state
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Validations
  const isOutOfStock = product.quantityAvailable <= 0;
  const canAdd = quantity < product.quantityAvailable;
  const canRemove = quantity > 1;

  /**
   * Main handler to add to cart
   */
  const handleAddToCart = async () => {
    // Basic validation
    if (isOutOfStock) {
      setSuccessMessage("❌ Out of stock");
      setShowSuccessDialog(true);
      return;
    }

    if (quantity <= 0 || quantity > product.quantityAvailable) {
      setSuccessMessage("⚠️ Invalid quantity");
      setShowSuccessDialog(true);
      return;
    }

    // Simulate delay for visual feedback
    setIsAdding(true);

    try {
      // Chama a função do hook
      addItem(product, quantity);

      // Success feedback
      setSuccessMessage(
        `✅ ${quantity}x ${product.name} added to cart!\n\n` +
        `Cart: ${totalQuantity + quantity} items | Total: R$ ${(totalPrice + product.price * quantity).toFixed(2)}`
      );
      setShowSuccessDialog(true);

      // Reset quantity
      setQuantity(1);

      // Optional callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setSuccessMessage("❌ Failed to add to cart");
      setShowSuccessDialog(true);
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Increase quantity
   */
  const handleIncreaseQuantity = () => {
    if (canAdd) {
      setQuantity((prev) => prev + 1);
    }
  };

  /**
   * Decrease quantity
   */
  const handleDecreaseQuantity = () => {
    if (canRemove) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Product information */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} variant="headlineMedium">
          {product.name}
        </Text>

        <Text style={[styles.price, { color: theme.colors.primary }]} variant="displaySmall">
          R$ {product.price.toFixed(2)}
        </Text>

        {/* Stock status */}
        <View style={styles.stockStatus}>
          {isOutOfStock ? (
            <Chip
              icon="alert-circle-outline"
              style={{ backgroundColor: theme.colors.error }}
              textStyle={{ color: "#fff" }}
            >
              Out of stock
            </Chip>
          ) : (
            <Chip
              icon="check-circle-outline"
              style={{ backgroundColor: theme.colors.primary }}
              textStyle={{ color: "#fff" }}
            >
              {product.quantityAvailable} units available
            </Chip>
          )}
        </View>
      </View>

      {/* Quantity selector */}
      {!isOutOfStock && (
        <View style={styles.quantitySection}>
          <Text variant="titleMedium" style={styles.quantityLabel}>
            Quantity
          </Text>

          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={handleDecreaseQuantity}
              disabled={!canRemove}
              style={[
                styles.quantityButton,
                !canRemove && styles.quantityButtonDisabled,
              ]}
            >
              <MaterialIcons
                name="remove"
                size={24}
                color={canRemove ? theme.colors.primary : "#ccc"}
              />
            </TouchableOpacity>

            <Text style={styles.quantityValue} variant="headlineSmall">
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={handleIncreaseQuantity}
              disabled={!canAdd}
              style={[
                styles.quantityButton,
                !canAdd && styles.quantityButtonDisabled,
              ]}
            >
              <MaterialIcons
                name="add"
                size={24}
                color={canAdd ? theme.colors.primary : "#ccc"}
              />
            </TouchableOpacity>
          </View>

          {!canAdd && (
            <Text style={styles.limitText} variant="bodySmall">
              You've reached the maximum available stock
            </Text>
          )}
        </View>
      )}

      {/* Add to cart button */}
      <Button
        mode="contained"
        onPress={handleAddToCart}
        loading={isAdding}
        disabled={isAdding || isOutOfStock}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </Button>

      {/* Current cart information */}
      {items.length > 0 && (
        <View style={styles.cartInfo}>
          <Text variant="bodySmall" style={styles.cartInfoText}>
            Cart: {totalQuantity} items | R$ {totalPrice.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Success dialog */}
      <Portal>
        <Dialog
          visible={showSuccessDialog}
          onDismiss={() => setShowSuccessDialog(false)}
        >
          <Dialog.Title>Cart</Dialog.Title>
          <Dialog.Content>
            <Text>{successMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSuccessDialog(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },

  productInfo: {
    gap: 8,
  },

  productName: {
    fontWeight: "600",
  },

  price: {
    fontWeight: "700",
  },

  stockStatus: {
    marginTop: 8,
  },

  quantitySection: {
    gap: 12,
  },

  quantityLabel: {
    fontWeight: "500",
  },

  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  quantityButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  quantityButtonDisabled: {
    opacity: 0.5,
  },

  quantityValue: {
    minWidth: 40,
    textAlign: "center",
    fontWeight: "600",
  },

  limitText: {
    color: "#ff9800",
    fontStyle: "italic",
  },

  addButton: {
    marginTop: 8,
    borderRadius: 8,
  },

  addButtonContent: {
    paddingVertical: 12,
  },

  cartInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },

  cartInfoText: {
    fontWeight: "500",
  },
});
