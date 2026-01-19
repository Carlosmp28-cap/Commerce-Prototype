import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Chip } from "react-native-paper";
import type { Product } from "../../../models/Product";

export default function PDPProductInfoDetail({ product }: { product: Product }) {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>Detalhes que importam</Text>
        <Text style={styles.text}>
          Construído para conforto diário com materiais macios e respiráveis,
          inspirado no look esportivo premium da Nike.
        </Text>
        <Text style={styles.text}>
          Ajuste: fiel ao tamanho • Amortecimento: responsivo • Uso: cotidiano
          e treinos leves.
        </Text>
      </View>

      {product.features?.length > 0 && (
        <View style={styles.features}>
          {product.features.map((f, i) => (
            <Chip
              key={i}
              style={styles.chip}
              textStyle={styles.chipText}
            >
              {f}
            </Chip>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 6,
  },
  features: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  chip: {
    backgroundColor: "#FFF",
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
});
