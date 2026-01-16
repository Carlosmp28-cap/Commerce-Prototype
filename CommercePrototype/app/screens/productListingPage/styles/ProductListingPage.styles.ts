import { StyleSheet } from "react-native";
import type { tokens } from "../../../themes";

type Theme = typeof tokens;

export const createStyles = (theme: Theme, screenWidth: number, numColumns: number) => {
  const spacing = theme.spacing;

  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: spacing.xs,
      color: theme.colors.text,
    },
    resultCount: {
      fontSize: 14,
      opacity: 0.7,
      color: theme.colors.text,
    },
    list: {
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    row: {
      justifyContent: "flex-start",
      gap: 8,
    },
    itemContainer: {
      flex: 1,
      maxWidth: (screenWidth - (numColumns + 1) * 8) / numColumns,
      marginBottom: spacing.sm,
    },
    image: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
    },
    productName: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      minHeight: 32,
      color: theme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.lg * 2.5,
    },
    emptyText: {
      fontSize: 16,
      opacity: 0.7,
      color: theme.colors.text,
    },
    card: {
      borderRadius: 8,
      padding: spacing.md,
      backgroundColor: theme.colors.background,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 1,
    },
  });
};

export const getStockStyle = (theme: Theme, inStock: boolean) => ({
  fontSize: 12,
  color: inStock ? theme.colors.primary : theme.colors.text,
  opacity: inStock ? 1 : 0.7,
});
