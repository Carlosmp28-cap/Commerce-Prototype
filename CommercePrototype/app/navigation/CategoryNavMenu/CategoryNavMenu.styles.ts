import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  webRoot: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  webRegion: {
    width: "100%",
    alignItems: "center",
  },
  webTopScroll: {
    width: "100%",
  },
  webTopBar: {
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexGrow: 1,
    justifyContent: "center",
  },
  webTopItem: {
    alignSelf: "center",
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  webTopItemText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  webTopItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    backgroundColor: "transparent",
  },
  webDropdown: {
    position: "absolute",
    top: 48,
    left: "50%",
    transform: [{ translateX: -260 }],
    minWidth: 520,
    maxWidth: 980,
    flexDirection: "row",
    borderWidth: 0,
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  webDropdownColumn: {
    minWidth: 260,
    paddingVertical: 8,
  },
  webDropdownColumnRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#00000008",
    paddingLeft: 16,
  },
  webDropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  webDropdownRowText: {
    fontSize: 15,
    fontWeight: "500",
  },
  webArrow: {
    fontSize: 18,
    opacity: 0.65,
  },
  nativeRow: {
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  nativePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
