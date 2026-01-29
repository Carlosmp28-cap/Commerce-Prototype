export const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    flexDirection: "row" as const,
    gap: 24,
    padding: 20,
  },

  rightColumn: {
    flex: 1,
    minWidth: 320,
    maxWidth: 420,
    width: "100%",
    gap: 16,
    position: "sticky",
    top: 20,
  },

  scrollContainer: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  itemsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },

  cartItemWrapper: {
    marginBottom: 5,
    width: "100%",
  },

  cartItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },

  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 4,
    backgroundColor: "#fafafa",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  itemImage: {
    fontSize: 32,
  },

  itemProductImage: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 4,
  },

  itemContent: {
    flex: 1,
    gap: 4,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
  },

  itemPrice: {
    fontSize: 12,
    color: "#666",
  },

  itemActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  quantityControl: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 6,
  },

  quantityBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  quantityBtnText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },

  quantityValue: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "600" as const,
    minWidth: 30,
    textAlign: "center" as const,
    color: "#333",
  },

  deleteBtn: {
    padding: 6,
    borderRadius: 36,
    backgroundColor: "#fff",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  deleteBtnIcon: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#999",
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#f5f5f7",
    padding: 50,
  },

  emptyStateIcon: {
    fontSize: 70,
    marginBottom: 16,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#999",
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center" as const,
  },

  summarySection: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 0,
    marginVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 2,
    width: "100%",
    maxWidth: 420,
  },

  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "bold" as const,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },

  itemCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  actionsContainer: {
    marginHorizontal: 0,
    marginBottom: 30,
    gap: 10,
    width: "100%",
  },

  checkoutButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center" as const,
  },

  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold" as const,
  },

  continueButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center" as const,
  },

  continueButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
};
