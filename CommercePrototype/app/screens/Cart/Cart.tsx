import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ButtonCheckout from "../../components/ButtonCheckout";
import ButtonContinueShop from "../../components/ButtonContinueShop";
import { useCart } from "../../hooks/useCart";
import type { RootStackParamList } from "../../navigation";
import { styles } from "./styles/Cart.styles";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export default function CartScreen({ navigation }: Props) {
  const { items, removeItem, updateQuantity } = useCart();

  // Functional updates to avoid stale state when tapping fast
  const handleRemoveItem = React.useCallback(
    (id: string) => {
      removeItem(id);
    },
    [removeItem]
  );

  const handleUpdateQuantity = React.useCallback(
    (id: string, newQuantity: number) => {
      updateQuantity(id, newQuantity);
    },
    [updateQuantity]
  );

  const subtotal = React.useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const renderCartItem = React.useCallback(
    ({ item }: { item: (typeof items)[0] }) => (
      <View style={styles.cartItemWrapper}>
        <View style={styles.cartItem}>
          <View style={styles.itemImageContainer}>
            <Text style={styles.itemImage}>📦</Text>
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemName} accessibilityRole="header">
              {item.product.name}
            </Text>
            <Text style={styles.itemPrice}>
              ${item.product.price.toFixed(2)}
            </Text>
          </View>

          <View style={styles.itemActions}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() =>
                  handleUpdateQuantity(item.product.id, item.quantity - 1)
                }
              >
                <Text style={styles.quantityBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() =>
                  handleUpdateQuantity(item.product.id, item.quantity + 1)
                }
              >
                <Text style={styles.quantityBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemoveItem(item.product.id)}
            >
              <Text style={styles.deleteBtnIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [handleRemoveItem, handleUpdateQuantity]
  );

  const isEmpty = items.length === 0;

  return (
    <View style={styles.container}>
      {/* LEFT: scrollable items (FlatList) */}
      <View style={styles.scrollContainer}>
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.product.id}
          showsVerticalScrollIndicator={false}
          // keep your padding/gap from itemsSection
          contentContainerStyle={
            isEmpty
              ? [
                  styles.itemsSection,
                  {
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]
              : styles.itemsSection
          }
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🛒</Text>
              <Text style={styles.emptyStateText}>Your bag is empty</Text>
              <Text style={styles.emptyStateSubtext}>
                Add items to get started
              </Text>
            </View>
          }
          // Optional virtualization tuning
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
        />
      </View>

      {/* RIGHT: summary + buttons */}
      {!isEmpty && (
        <View style={styles.rightColumn}>
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <Text style={styles.itemCount}>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <ButtonCheckout
              title="Proceed to Checkout"
              onPress={() => {
                navigation.navigate("Checkout", { totalTax: total });
              }}
            />

            <ButtonContinueShop
              title="Continue Shopping"
              onPress={() => navigation.navigate("PLP")}
            />
          </View>
        </View>
      )}
    </View>
  );
}
