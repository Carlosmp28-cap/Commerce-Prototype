import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  valueProps: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  valueProp: {
    width: "31%",
    minWidth: 160,
    gap: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  valuePropTitle: { fontWeight: "900" },
  valuePropBody: { opacity: 0.75, fontSize: 12 },
});
