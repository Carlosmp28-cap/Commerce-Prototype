import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, Chip } from "react-native-paper";
import type { Product } from "../../../models/Product";
import { useTheme } from "../../../themes";
import HtmlDescription from "../../../utils/HtmlDescription";

export default function PDPProductInfoDetail({
  product,
}: {
  product: Product;
}) {
  const theme = useTheme();
  const features = product.features ?? [];
  const details = product.details;

  if (!details) return null;

  return (
    <>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {details.title}
        </Text>
        {details.paragraphs.map((p, idx) =>
          // If the paragraph contains HTML tags (e.g. <ul>/<li>), render via HtmlDescription
          /<[^>]+>/.test(p) ? (
            <HtmlDescription key={idx} html={p} />
          ) : (
            <Text
              key={idx}
              style={[styles.text, { color: theme.colors.mutedText }]}
            >
              {p}
            </Text>
          ),
        )}
      </View>

      {features.length > 0 && (
        <View style={styles.features}>
          {features.map((f, i) => (
            <Chip
              key={i}
              style={[
                styles.chip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              textStyle={[styles.chipText, { color: theme.colors.text }]}
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  features: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  chip: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
