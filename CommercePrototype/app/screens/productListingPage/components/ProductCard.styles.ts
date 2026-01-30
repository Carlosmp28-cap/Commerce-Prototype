import { StyleSheet } from "react-native";

/**
 * Styles for ProductCard component
 */
export const styles = StyleSheet.create({
  productName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    // Reserve space for up to 2 lines to avoid overlap with price on small screens
    minHeight: 44,
    lineHeight: 18,
  },
  category: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4,
    opacity: 0.7,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stock: {
    fontSize: 12,
  },
});
