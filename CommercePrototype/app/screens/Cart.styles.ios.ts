export const styles = {
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },

  scrollContainer: {
    flex: 1,
  },

  // Header section
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },

  // Items section
  itemsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },

  // Cart item
  cartItemWrapper: {
    marginBottom: 0,
  },

  cartItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },

  itemImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    flexShrink: 0,
  },

  itemImage: {
    fontSize: 36,
  },

  itemContent: {
    flex: 1,
    gap: 5,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },

  itemPrice: {
    fontSize: 13,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  itemActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },

  // Quantity control
  quantityControl: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f2f2f7",
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 10,
  },

  quantityBtn: {
    width: 28,
    height: 28,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  quantityBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#007AFF",
  },

  quantityValue: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#000",
    minWidth: 24,
    textAlign: "center" as const,
  },

  // Delete button
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "transparent",
  },

  deleteBtnIcon: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500" as const,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 80,
    backgroundColor: "#f2f2f7",
    gap: 12,
  },

  emptyStateIcon: {
    fontSize: 64,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
  },

  emptyStateSubtext: {
    fontSize: 13,
    color: "#86868b",
    textAlign: "center" as const,
  },

  // Summary section
  summarySection: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    gap: 12,
  },

  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  summaryValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500" as const,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5ea",
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 2,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#007AFF",
  },

  itemCount: {
    fontSize: 12,
    color: "#86868b",
    marginTop: 0,
  },

  // Actions container
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    gap: 10,
  },

  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },

  continueButton: {
    backgroundColor: "#e5e5ea",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  continueButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
  },
};
