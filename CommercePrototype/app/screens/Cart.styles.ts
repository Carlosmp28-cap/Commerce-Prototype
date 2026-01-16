import { Platform } from "react-native";
// Used as Fallback for web and iOS/Android styles
const isWeb = Platform.OS === "web";
const isIOS = Platform.OS === "ios";
const isAndroid = Platform.OS === "android";

export const styles = {
  // Main container
  container: {
    flex: 1,
    backgroundColor: isWeb ? "#f5f5f7" : isIOS ? "#f2f2f7" : "#fafafa",
  },

  scrollContainer: {
    flex: 1,
  },

  rightColumn: {
    marginTop: 16,
  },

  contentRow: { flex: 1, flexDirection: "row" },
  leftColumn: { flex: 1 },

  // Header section
  header: {
    paddingHorizontal: isWeb ? 32 : isIOS ? 20 : 16,
    paddingTop: isWeb ? 32 : isIOS ? 20 : 16,
    paddingBottom: isWeb ? 24 : isIOS ? 16 : 12,
    backgroundColor: "#fff",
    borderBottomWidth: isAndroid ? 0.5 : 0,
    borderBottomColor: "#e5e5ea",
  },

  // Items section
  itemsSection: {
    paddingHorizontal: isWeb ? 32 : isIOS ? 20 : 16,
    paddingVertical: isWeb ? 20 : isIOS ? 16 : 12,
    gap: isWeb ? 12 : isIOS ? 10 : 8,
  },

  // Cart item
  cartItemWrapper: {
    marginBottom: 0,
  },

  cartItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderRadius: isWeb ? 12 : isIOS ? 10 : 8,
    padding: isWeb ? 16 : isIOS ? 14 : 12,
    gap: isWeb ? 16 : isIOS ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
    shadowColor: isAndroid ? "#000" : "transparent",
    shadowOffset: isAndroid ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: isAndroid ? 0.08 : 0,
    shadowRadius: isAndroid ? 2 : 0,
    elevation: isAndroid ? 1 : 0,
  },

  itemImageContainer: {
    width: isWeb ? 80 : isIOS ? 72 : 68,
    height: isWeb ? 80 : isIOS ? 72 : 68,
    borderRadius: isWeb ? 10 : isIOS ? 8 : 6,
    backgroundColor: "#f5f5f7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    flexShrink: 0,
  },

  itemImage: {
    fontSize: isWeb ? 40 : isIOS ? 36 : 32,
  },

  itemContent: {
    flex: 1,
    gap: isWeb ? 6 : isIOS ? 5 : 4,
  },

  itemName: {
    fontSize: isWeb ? 16 : isIOS ? 15 : 14,
    fontWeight: "600" as const,
    color: "#000",
  },

  itemPrice: {
    fontSize: isWeb ? 15 : isIOS ? 13 : 12,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  itemActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: isWeb ? 12 : isIOS ? 10 : 8,
  },

  // Quantity control
  quantityControl: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: isWeb ? "#f5f5f7" : isIOS ? "#f2f2f7" : "#f5f5f5",
    borderRadius: isWeb ? 8 : isIOS ? 7 : 6,
    paddingHorizontal: isWeb ? 8 : isIOS ? 6 : 5,
    paddingVertical: isWeb ? 6 : isIOS ? 5 : 4,
    gap: isWeb ? 12 : isIOS ? 10 : 8,
    borderWidth: isAndroid ? 0.5 : 0,
    borderColor: "#e0e0e0",
  },

  quantityBtn: {
    width: isWeb ? 32 : isIOS ? 28 : 26,
    height: isWeb ? 32 : isIOS ? 28 : 26,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  quantityBtnText: {
    fontSize: isWeb ? 18 : isIOS ? 16 : 14,
    fontWeight: "600" as const,
    color: "#007AFF",
  },

  quantityValue: {
    fontSize: isWeb ? 15 : isIOS ? 14 : 13,
    fontWeight: "500" as const,
    color: "#000",
    minWidth: isWeb ? 28 : isIOS ? 24 : 20,
    textAlign: "center" as const,
  },

  // Delete button
  deleteBtn: {
    width: isWeb ? 34 : isIOS ? 30 : 28,
    height: isWeb ? 34 : isIOS ? 30 : 28,
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: isAndroid ? "#f5f5f5" : "transparent",
  },

  deleteBtnIcon: {
    fontSize: isWeb ? 16 : isIOS ? 14 : 12,
    color: "#999",
    fontWeight: "500" as const,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: isWeb ? 100 : isIOS ? 80 : 60,
    backgroundColor: isWeb ? "#f5f5f7" : isIOS ? "#f2f2f7" : "#fafafa",
    gap: isWeb ? 16 : isIOS ? 12 : 10,
  },

  emptyStateIcon: {
    fontSize: isWeb ? 80 : isIOS ? 64 : 56,
  },

  emptyStateText: {
    fontSize: isWeb ? 18 : isIOS ? 16 : 15,
    fontWeight: "600" as const,
    color: "#000",
  },

  emptyStateSubtext: {
    fontSize: isWeb ? 15 : isIOS ? 13 : 12,
    color: "#86868b",
    textAlign: "center" as const,
  },

  // Summary section
  summarySection: {
    marginHorizontal: isWeb ? 32 : isIOS ? 20 : 16,
    marginVertical: isWeb ? 24 : isIOS ? 20 : 16,
    paddingHorizontal: isWeb ? 20 : isIOS ? 16 : 14,
    paddingVertical: isWeb ? 20 : isIOS ? 16 : 14,
    backgroundColor: "#fff",
    borderRadius: isWeb ? 12 : isIOS ? 10 : 8,
    gap: isWeb ? 14 : isIOS ? 12 : 10,
    borderWidth: isAndroid ? 0.5 : 0,
    borderColor: "#e0e0e0",
    shadowColor: isAndroid ? "#000" : "transparent",
    shadowOffset: isAndroid ? { width: 0, height: 1 } : { width: 0, height: 0 },
    shadowOpacity: isAndroid ? 0.06 : 0,
    shadowRadius: isAndroid ? 2 : 0,
    elevation: isAndroid ? 1 : 0,
  },

  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },

  summaryLabel: {
    fontSize: isWeb ? 15 : isIOS ? 14 : 13,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  summaryValue: {
    fontSize: isWeb ? 15 : isIOS ? 14 : 13,
    color: "#000",
    fontWeight: "500" as const,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5ea",
    marginVertical: isWeb ? 10 : isIOS ? 8 : 6,
  },

  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: isWeb ? 4 : isIOS ? 2 : 0,
  },

  totalLabel: {
    fontSize: isWeb ? 17 : isIOS ? 16 : 15,
    fontWeight: "600" as const,
    color: "#000",
  },

  totalValue: {
    fontSize: isWeb ? 22 : isIOS ? 20 : 18,
    fontWeight: "700" as const,
    color: "#007AFF",
  },

  itemCount: {
    fontSize: isWeb ? 13 : isIOS ? 12 : 11,
    color: "#86868b",
    marginTop: isWeb ? 2 : 0,
  },

  // Actions container
  actionsContainer: {
    marginHorizontal: isWeb ? 32 : isIOS ? 20 : 16,
    marginBottom: isWeb ? 40 : isIOS ? 32 : 24,
    gap: isWeb ? 12 : isIOS ? 10 : 8,
  },

  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: isWeb ? 16 : isIOS ? 14 : 12,
    borderRadius: isWeb ? 12 : isIOS ? 10 : 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  checkoutButtonText: {
    fontSize: isWeb ? 17 : isIOS ? 16 : 15,
    fontWeight: "600" as const,
    color: "#fff",
  },

  continueButton: {
    backgroundColor: "#e5e5ea",
    paddingVertical: isWeb ? 16 : isIOS ? 14 : 12,
    borderRadius: isWeb ? 12 : isIOS ? 10 : 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  continueButtonText: {
    fontSize: isWeb ? 17 : isIOS ? 16 : 15,
    fontWeight: "600" as const,
    color: "#000",
  },
};
