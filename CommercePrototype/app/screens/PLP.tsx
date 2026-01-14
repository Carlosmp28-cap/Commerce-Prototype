import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { List, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import { getProductsByQuery } from "../data/catalog";

type Props = NativeStackScreenProps<RootStackParamList, "PLP">;

export default function PLPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const q = route.params?.q;

  const products = useMemo(() => getProductsByQuery(q), [q]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Product listing (mock){q ? ` — ${q}` : ""}
      </Text>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <List.Item
            onPress={() => navigation.navigate("PDP", { id: item.id })}
            accessibilityLabel={`Open product ${item.name}`}
            title={item.name}
            titleStyle={{ color: theme.colors.text, fontWeight: "900" }}
            description={`€ ${item.price.toFixed(2)} • ${
              item.quantityAvailable > 0
                ? `${item.quantityAvailable} in stock`
                : "Out of stock"
            }`}
            right={() => (
              <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
                View
              </Text>
            )}
            style={styles.row}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  subtitle: { opacity: 0.8, marginBottom: 10 },
  list: { gap: 10, paddingBottom: 20 },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
});
