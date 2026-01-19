import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation";
import type { Product } from "../../../models/Product";
import { categories } from "../../../data/catalog";

interface PDPBreadcrumbProps {
  product: Product;
  navigation: NativeStackNavigationProp<RootStackParamList, "PDP">;
}

export default function PDPBreadcrumb({ product, navigation }: PDPBreadcrumbProps) {
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.link}>Home</Text>
      </TouchableOpacity>
      <Text style={styles.sep}> › </Text>
      <TouchableOpacity onPress={() => navigation.navigate("PLP", { q: category?.query })}>
        <Text style={styles.link}>{category?.label || "Products"}</Text>
      </TouchableOpacity>
      <Text style={styles.sep}> › </Text>
      <Text style={styles.link}>{product.name}</Text>
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
    color: "#4e4e4e",
    fontWeight: "500",
  },
  sep: {
    fontSize: 14,
    color: "#CCC",
    marginHorizontal: 4,
  },
});
