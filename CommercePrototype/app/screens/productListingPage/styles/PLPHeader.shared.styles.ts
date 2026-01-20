import { StyleSheet } from "react-native";

/**
 * Shared styles for PLPHeader (mobile/web)
 */
export const sharedStyles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    position: "relative",
  },
  titleContainer: {
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row-reverse",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 4,
  },
});
