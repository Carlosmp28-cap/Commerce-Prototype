import { useState, useRef, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Button, Menu, Surface } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Product } from "../../../models/Product";
import { useTheme } from "../../../themes";

interface PDPQuantitySelectorProps {
  product: Product;
  // onAddToCart may return a boolean or an object/string with a message for failures
  onAddToCart: (
    quantity: number,
  ) => Promise<boolean | { message?: string } | string> | void;
}

export default function PDPQuantitySelector({
  product,
  onAddToCart,
}: PDPQuantitySelectorProps) {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);
  const navigation = useNavigation<any>();
  const anchorRef = useRef(null);
  const timeoutRef = useRef<any>(null);

  // Auto-dismiss the toast after a short delay and clear any pending timer
  useEffect(() => {
    if (snackbarVisible) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setSnackbarVisible(false);
      }, 8000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [snackbarVisible]);

  const hasVariants = Boolean(product.variants && product.variants.length > 0);

  if (product.quantityAvailable === 0 && !hasVariants) return null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // allow micro delay for pressed state UX
      await new Promise((r) => setTimeout(r, 200));
      const result = await onAddToCart(quantity);

      // Normalize success/message
      if (typeof result === "boolean") {
        if (result) {
          setSnackbarMessage(`${quantity}× ${product.name} added to cart`);
          setSnackbarError(false);
          setSnackbarVisible(true);
          setQuantity(1);
        } else {
          setSnackbarMessage("Failed to add item to cart. Please try again.");
          setSnackbarError(true);
          setSnackbarVisible(true);
        }
      } else if (typeof result === "string") {
        // Treat returned string as message (success or error depending on usage)
        setSnackbarMessage(result);
        setSnackbarError(false);
        setSnackbarVisible(true);
      } else if (result && typeof result === "object") {
        const msg = result.message;
        if (msg) {
          setSnackbarMessage(msg);
          setSnackbarError(true);
          setSnackbarVisible(true);
        } else {
          setSnackbarMessage(`${quantity}× ${product.name} added to cart`);
          setSnackbarError(false);
          setSnackbarVisible(true);
          setQuantity(1);
        }
      } else {
        // void or undefined -> assume success
        setSnackbarMessage(`${quantity}× ${product.name} added to cart`);
        setSnackbarError(false);
        setSnackbarVisible(true);
        setQuantity(1);
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "An error occurred while adding to cart.";
      setSnackbarMessage(message);
      setSnackbarError(true);
      setSnackbarVisible(true);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.wrapper}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Quantity
          </Text>
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
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={[styles.text, { color: theme.colors.text }]}>
                  {quantity}
                </Text>
                <MaterialIcons
                  name="expand-more"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            }
          >
            {Array.from(
              {
                length: Math.min(
                  product.quantityAvailable > 0
                    ? product.quantityAvailable
                    : 10,
                  10,
                ),
              },
              (_, i) => i + 1,
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

      {snackbarVisible ? (
        <View pointerEvents="box-none" style={styles.toastContainer}>
          <Surface
            style={[styles.toast, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.toastContent}>
              <Text
                style={{ color: theme.colors.text }}
                accessibilityRole="text"
              >
                {snackbarMessage}
              </Text>

              <View style={styles.toastActions}>
                <Button
                  mode="text"
                  onPress={() => {
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                      timeoutRef.current = null;
                    }
                    setSnackbarVisible(false);
                  }}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Continue shopping
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                      timeoutRef.current = null;
                    }
                    setSnackbarVisible(false);
                    try {
                      navigation.navigate("Cart");
                    } catch {
                      // ignore in tests where navigation may not be available
                    }
                  }}
                  style={styles.toastViewCart}
                  labelStyle={{ color: theme.colors.surface }}
                >
                  View cart
                </Button>
              </View>
            </View>
          </Surface>
        </View>
      ) : null}

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
          <MaterialIcons
            name="local-shipping"
            size={16}
            color={theme.colors.mutedText}
          />
          <Text
            style={[styles.shippingText, { color: theme.colors.mutedText }]}
          >
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
  toastContainer: {
    alignItems: "stretch",
    width: "100%",
    marginTop: 12,
    zIndex: 2000,
    paddingHorizontal: 12,
  },
  toast: {
    width: "100%",
    maxWidth: "100%",
    borderRadius: 10,
    padding: 12,
    elevation: 6,
    alignSelf: "stretch",
  },
  toastContent: {
    width: "100%",
  },
  toastActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  toastViewCart: {
    marginLeft: 8,
  },
});
