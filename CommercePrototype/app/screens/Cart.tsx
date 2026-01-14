import React, { useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ButtonCheckout from "../components/ButtonCheckout";
import ButtonContinueShop from "../components/ButtonContinueShop";
import styles from "./Cart.styles";

// Test data for cart items
const INITIAL_CART_ITEMS = [
  {
    id: "1",
    name: "Wireless Headphones",
    price: 79.99,
    quantity: 1,
    image: "🎧",
  },
  { id: "2", name: "USB-C Cable", price: 15.99, quantity: 2, image: "🔌" },
  { id: "3", name: "Phone Case", price: 24.99, quantity: 1, image: "📱" },
  { id: "4", name: "Screen Protector", price: 9.99, quantity: 3, image: "🛡️" },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const { width } = useWindowDimensions();

  // Responsive layout: stack vertically on small screens, horizontal on large
  const isSmallScreen = width < 768;

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Update quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Render cart item
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Text style={styles.itemImage}>{item.image}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityBtn}
          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const isEmpty = cartItems.length === 0;

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isSmallScreen ? "column" : "row" },
      ]}
    >
      {/* Left Side - Cart Items */}
      <View
        style={[
          styles.leftSection,
          {
            flex: isSmallScreen ? 1 : 2,
            borderRightWidth: isSmallScreen ? 0 : 1,
            borderBottomWidth: isSmallScreen ? 1 : 0,
          },
        ]}
      >
        <Text style={styles.title}>Shopping Cart</Text>
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
          />
        )}
      </View>

      {/* Right Side - Summary & Checkout */}
      {isEmpty ? (
        <View
          style={[
            styles.rightSection,
            {
              flex: isSmallScreen ? 1 : 1,
              justifyContent: "center" as const,
              alignItems: "center" as const,
            },
          ]}
        >
          <Text style={styles.emptyText}>Add items to checkout</Text>
        </View>
      ) : (
        <View style={[styles.rightSection, { flex: isSmallScreen ? 1 : 1 }]}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%):</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            <Text style={styles.itemCountText}>
              Items in cart: {cartItems.length}
            </Text>
          </View>

          <ButtonCheckout
            title="Proceed to Checkout"
            onPress={() => {
              console.log("Proceeding to checkout...");
            }}
          />

          <ButtonContinueShop
            title="Continue Shopping"
            onPress={() => {
              console.log("Continuing shopping...");
            }}
          />
        </View>
      )}
    </View>
  );
}
