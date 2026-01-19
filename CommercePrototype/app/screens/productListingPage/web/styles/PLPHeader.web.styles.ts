import { StyleSheet } from "react-native";
import { sharedStyles } from "../../styles/PLPHeader.shared.styles";

export const styles = StyleSheet.create({
  ...sharedStyles,
  topRow: {
    ...sharedStyles.topRow,
    paddingVertical: 8,
  },
  backButtonContainer: {
    position: "absolute",
    left: 0,
    zIndex: 10,
  },
  titleContainer: {
    ...sharedStyles.titleContainer,
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
    ...sharedStyles.buttonLabel,
    marginLeft: 8,
  },
  button: {
    borderRadius: 8,
    minWidth: 130,
  },
  buttonContent: {
    ...sharedStyles.buttonContent,
  },
  menuContent: {
    marginTop: 50,
  },
  menuItemTitleBold: {
    fontWeight: "600",
  },
});
