import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import type { Product } from "../models/Product";

// Product List Page (PLP): lista de produtos com cache-first strategy.
// TODO: integrar com useApi/useCache para buscar produtos e paginação.
const mockProducts: Product[] = [];

export default function PLPScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("PDP", { id: item.id })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
