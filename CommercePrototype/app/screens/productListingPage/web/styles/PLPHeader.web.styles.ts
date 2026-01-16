import { StyleSheet } from "react-native";

/**
 * Styles for PLPHeader web version
 */
export const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: "relative",
  },
  backButtonContainer: {
    position: "absolute",
    left: 0,
    zIndex: 10,
  },
  titleContainer: {
    alignItems: "center",
    zIndex: 1,
  },
  controlsContainer: {
    position: "absolute",
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    zIndex: 2,
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
