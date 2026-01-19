import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  grid: { flexDirection: "row" },
  gridColumn: { flexDirection: "column" },
  colMain: { flex: 1 },
  colSummary: { width: 320, marginLeft: 12 },
  colSummaryNarrow: { width: "100%", marginLeft: 0, marginTop: 8 },
  actions: { flexDirection: "row", marginTop: 12 },

  /* Checkout / common cards */
  card: { marginVertical: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#111111" },
  hint: { marginBottom: 8, color: "#333333" },
  subLabel: { fontWeight: "600", marginTop: 6, marginBottom: 4 },

  /* inputs / layout */
  input: { marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center" },

  /* payment */
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioLabel: { marginLeft: 4 },

  /* suggestions */
  suggestionsCard: { marginHorizontal: 0, maxHeight: 200, marginTop: 8 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  suggestionMeta: { fontSize: 12, color: "#666", marginTop: 4 },

  /* order summary */
  summaryCard: { marginTop: 6 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },

  /* misc */
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { opacity: 0.8 },
});