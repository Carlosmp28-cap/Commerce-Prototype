import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  carousel: { gap: 12, paddingVertical: 4 },
  productCard: {
    width: 180,
    borderRadius: 14,
  },
  productImage: {
    height: 110,
    borderRadius: 10,
  },
  productContent: { paddingTop: 10 },
  productTitle: { fontWeight: "900" },
  productMeta: { marginTop: 2, opacity: 0.7 },
  productPrice: { marginTop: 6, fontWeight: "900" },
});
