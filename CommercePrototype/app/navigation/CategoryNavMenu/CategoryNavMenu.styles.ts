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
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexGrow: 1,
    justifyContent: "center",
  },
  webTopItem: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  webDropdown: {
    position: "absolute",
    top: 54,
    left: "50%",
    transform: [{ translateX: -180 }],
    minWidth: 360,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  webDropdownColumn: {
    minWidth: 220,
  },
  webDropdownColumnRight: {
    borderLeftWidth: 1,
    borderLeftColor: "#00000014",
  },
  webDropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  webDropdownRowText: {
    fontSize: 14,
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
