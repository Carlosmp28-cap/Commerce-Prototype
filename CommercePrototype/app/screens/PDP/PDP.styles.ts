import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Desktop Layout
  contentRow: {
    flexDirection: "row",
    gap: 50,
    marginBottom: 64,
  },
  rightColumn: {
    flex: 1,
    gap: 0,
  },
});
