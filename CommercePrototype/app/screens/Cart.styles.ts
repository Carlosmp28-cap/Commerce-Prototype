// Styles
const styles = {
  container: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: "#f5f5f5",
  },
  leftSection: {
    flex: 2,
    padding: 16,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  rightSection: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "space-between" as const,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 16,
  },
  cartItemContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },
  itemImage: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
  },
  itemPrice: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  quantityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityBtnText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },
  quantity: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "600" as const,
    minWidth: 30,
    textAlign: "center" as const,
  },
  removeBtn: {
    padding: 6,
    borderRadius: 36,
    backgroundColor: "#ffebee",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  removeBtnText: {
    fontSize: 18,
    color: "#d32f2f",
    fontWeight: "bold" as const,
  },
  summaryContent: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
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
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#000",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#007AFF",
  },
  itemCountText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  checkoutBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  checkoutBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  continueShoppingBtn: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center" as const,
  },
  continueShoppingBtnText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
};
export default styles;
