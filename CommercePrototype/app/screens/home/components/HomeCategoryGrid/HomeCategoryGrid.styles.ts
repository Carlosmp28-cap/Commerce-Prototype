import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryTile: { width: "48%", borderRadius: 14 },
  categoryTileImage: {
    height: 110,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  categoryTileContent: { paddingTop: 10, gap: 2 },
  categoryTileLabel: { fontWeight: "900" },
  categoryTileSubtitle: { opacity: 0.7 },
});
