import React from "react";
import { StyleSheet, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation";
import type { Product } from "../../../models/Product";

interface PDPRelatedProductsProps {
  products: Product[];
  navigation: NativeStackNavigationProp<RootStackParamList, "PDP">;
}

export default function PDPRelatedProducts({
  products,
  navigation,
}: PDPRelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Related Products</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.push("PDP", { id: item.id })}
            style={styles.item}
          >
            <Card style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.price}>€ {item.price.toFixed(2)}</Text>
                {item.rating && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <MaterialIcons name="star" size={12} color="#FFB800" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },
  list: {
    paddingRight: 16,
  },
  item: {
    marginRight: 12,
  },
  card: {
    width: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: "#999",
  },
});
