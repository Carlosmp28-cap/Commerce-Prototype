import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Desktop Layout
  contentRow: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 64,
    justifyContent: "center",
  },
  rightColumn: {
    maxWidth: 450,
    gap: 0,
  },
});
