import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Desktop Layout
  contentRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 64,
    justifyContent: "center",
  },
  rightColumn: {
    maxWidth: 450,
    gap: 0,
  },
  // Variant selector styles
  variantContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "transparent",
    marginRight: 8,
    marginBottom: 8,
  },
  variantChipPressed: {
    opacity: 0.9,
  },
  variantChipSelected: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  variantChipDisabled: {
    opacity: 0.5,
  },
  variantText: {
    fontSize: 14,
    fontWeight: "600",
  },
  variantTextSelected: {
    color: "#fff",
  },
  variantDropdownContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});
