import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    borderBottomColor: "#00000014",
  },
  topRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  left: {
    width: 72,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    width: 132,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  secondaryRow: {
    borderTopWidth: 1,
    alignItems: "center",
    paddingVertical: 8,
    width: "100%",
    justifyContent: "center",
  },
});
