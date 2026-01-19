import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation";
import type { Product } from "../../../models/Product";
import { categories } from "../../../data/catalog";
import Text from "../../../components/Text";
import { useTheme } from "../../../themes";

interface PDPBreadcrumbProps {
  product: Product;
  navigation: NativeStackNavigationProp<RootStackParamList, "PDP">;
}

export default function PDPBreadcrumb({ product, navigation }: PDPBreadcrumbProps) {
  const theme = useTheme();
  const category = categories.find((c) => c.id === product.categoryId);
  const categoryLabel = category?.label || "Products";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go home"
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={[styles.link, { color: theme.colors.mutedText }]}>Home</Text>
      </TouchableOpacity>
      <Text style={[styles.sep, { color: theme.colors.subtleText }]}> › </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open category ${categoryLabel}`}
        onPress={() => navigation.navigate("PLP", { q: category?.query })}
      >
        <Text style={[styles.link, { color: theme.colors.mutedText }]}>
          {categoryLabel}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.sep, { color: theme.colors.subtleText }]}> › </Text>
      <Text style={[styles.link, { color: theme.colors.mutedText }]}>{product.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingVertical: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
  },
  sep: {
    fontSize: 14,
    marginHorizontal: 4,
  },
});
