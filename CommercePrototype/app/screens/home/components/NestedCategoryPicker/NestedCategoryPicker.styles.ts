import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    // Secondary header styling (intentionally less prominent than other section titles).
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  selectedLabel: {
    marginTop: -4,
    fontSize: 12,
  },
  parentRow: {
    gap: 8,
    paddingVertical: 4,
  },
  webMenuRoot: {
    position: "relative",
  },
  webTopBar: {
    gap: 8,
    paddingVertical: 6,
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
    left: 0,
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
  parentPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  parentPillText: {
    fontSize: 14,
  },
  nestedArea: {
    gap: 10,
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  allChip: {
    alignSelf: "flex-start",
  },
  childRow: {
    gap: 8,
    paddingVertical: 2,
  },
  childChip: {
    alignSelf: "flex-start",
  },
  groupBlock: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  grandChildRow: {
    gap: 8,
    paddingVertical: 2,
  },
  grandChildChip: {
    alignSelf: "flex-start",
  },
});
