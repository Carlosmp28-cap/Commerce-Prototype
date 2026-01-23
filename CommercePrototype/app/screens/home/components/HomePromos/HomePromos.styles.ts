import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  promoRow: { flexDirection: "row", gap: 12 },
  promoRowColumn: { flexDirection: "column" },
  promoCard: { flex: 1, borderRadius: 14 },
  promoContent: { gap: 6, paddingTop: 14 },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  promoTitle: { fontWeight: "900" },
  promoSubtitle: { opacity: 0.75 },
  promoCta: { fontWeight: "900", marginTop: 4 },
});
