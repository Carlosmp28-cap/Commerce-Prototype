import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import ButtonCheckout from "../components/ButtonCheckout";
import ButtonContinueShop from "../components/ButtonContinueShop";
import type { RootStackParamList } from "../navigation";
import { styles } from "./Cart.styles";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

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
  {
    id: "5",
    name: "Bluetooth Speaker",
    price: 49.99,
    quantity: 1,
    image: "🔊",
  },
  { id: "6", name: "Portable Charger", price: 29.99, quantity: 1, image: "🔋" },
  { id: "7", name: "Wireless Mouse", price: 19.99, quantity: 2, image: "🖱️" },
  {
    id: "8",
    name: "Mechanical Keyboard",
    price: 89.99,
    quantity: 1,
    image: "⌨️",
  },
  { id: "9", name: "Laptop Stand", price: 34.99, quantity: 1, image: "💻" },
  {
    id: "10",
    name: "Monitor Cleaning Kit",
    price: 12.99,
    quantity: 1,
    image: "🧴",
  },
  { id: "11", name: "Smartwatch Band", price: 14.99, quantity: 1, image: "⌚" },
  { id: "12", name: "LED Light Strip", price: 22.99, quantity: 1, image: "🌈" },
  {
    id: "13",
    name: "Gaming Controller",
    price: 59.99,
    quantity: 1,
    image: "🎮",
  },
  { id: "14", name: "USB Hub", price: 18.99, quantity: 1, image: "🔌" },
  {
    id: "15",
    name: "Noise Cancelling Earbuds",
    price: 69.99,
    quantity: 1,
    image: "🎧",
  },
  {
    id: "16",
    name: "Action Camera Mount",
    price: 11.99,
    quantity: 1,
    image: "📷",
  },
  { id: "17", name: "Desk Mat", price: 15.99, quantity: 1, image: "🖤" },
  {
    id: "18",
    name: "VR Headset Cover",
    price: 25.99,
    quantity: 1,
    image: "🕶️",
  },
  {
    id: "19",
    name: "Micro SD Card 128GB",
    price: 19.99,
    quantity: 2,
    image: "💾",
  },
  { id: "20", name: "Ethernet Cable", price: 7.99, quantity: 3, image: "🔌" },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartScreen({ navigation }: Props) {
  const [cartItems, setCartItems] =
    React.useState<CartItem[]>(INITIAL_CART_ITEMS);

  // prepare transferable payload for checkout (stable reference)
  const checkoutPayload = React.useMemo(
    () =>
      items.map((i) => ({
        id: i.product.id,
        title: i.product.name,
        qty: i.quantity,
        price: i.product.price,
      })),
    [items]
  );

  // Functional updates to avoid stale state when tapping fast
  const handleRemoveItem = React.useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateQuantity = React.useCallback(
    (id: string, newQuantity: number) => {
      setCartItems((prev) => {
        if (newQuantity <= 0) return prev.filter((item) => item.id !== id);
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
      });
    },
    []
  );

  const subtotal = React.useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const renderCartItem = React.useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItemWrapper}>
        <View style={styles.cartItem}>
          <View style={styles.itemImageContainer}>
            <Text style={styles.itemImage}>{item.image}</Text>
          </View>

          <View style={styles.itemContent}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          </View>

          <View style={styles.itemActions}>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.quantityBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.quantityBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Text style={styles.deleteBtnIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [handleRemoveItem, handleUpdateQuantity]
  );

  const isEmpty = cartItems.length === 0;

  return (
    <View style={styles.container}>
      {/* LEFT: scrollable items (FlatList) */}
      <View style={styles.scrollContainer}>
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
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
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <ButtonCheckout
              title="Proceed to Checkout"
              onPress={() => navigation.navigate("Checkout", { items: checkoutPayload })}
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
