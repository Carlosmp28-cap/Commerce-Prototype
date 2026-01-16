export const styles = {
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  scrollContainer: {
    flex: 1,
  },

  // Header section
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5ea",
  },

  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#000",
    letterSpacing: 0,
  },

  // Items section
  itemsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 8,
  },

  // Cart item
  cartItemWrapper: {
    marginBottom: 0,
  },

  cartItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  itemImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    flexShrink: 0,
  },

  itemImage: {
    fontSize: 32,
  },

  itemContent: {
    flex: 1,
    gap: 4,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000",
  },

  itemPrice: {
    fontSize: 12,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  itemActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  // Quantity control
  quantityControl: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 4,
    gap: 8,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },

  quantityBtn: {
    width: 26,
    height: 26,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  quantityBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#007AFF",
  },

  quantityValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#000",
    minWidth: 20,
    textAlign: "center" as const,
  },

  // Delete button
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 50,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
  },

  deleteBtnIcon: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500" as const,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 60,
    backgroundColor: "#fafafa",
    gap: 10,
  },

  emptyStateIcon: {
    fontSize: 56,
  },

  emptyStateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },

  emptyStateSubtext: {
    fontSize: 12,
    color: "#86868b",
    textAlign: "center" as const,
  },

  // Summary section
  summarySection: {
    marginHorizontal: 16,
    marginTop: 0, // keep
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    gap: 6,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },

  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },

  summaryLabel: {
    fontSize: 13,
    color: "#86868b",
    fontWeight: "400" as const,
  },

  summaryValue: {
    fontSize: 13,
    color: "#000",
    fontWeight: "500" as const,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e5ea",
    marginVertical: 6,
  },

  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 0,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#007AFF",
  },

  itemCount: {
    fontSize: 11,
    color: "#86868b",
    marginTop: 0,
  },

  // Actions container
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    gap: 6,
  },

  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  checkoutButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },

  continueButton: {
    backgroundColor: "#e5e5ea",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  continueButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },
};
