import { StyleSheet } from "react-native";

/**
 * Styles for SortControls component
 */
export const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  button: {
    borderRadius: 8,
    minWidth: 130,
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  menuContent: {
    marginTop: 50,
  },
  menuItemTitleBold: {
    fontWeight: "600",
  },
});
