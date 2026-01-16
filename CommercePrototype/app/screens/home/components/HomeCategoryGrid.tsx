import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";

export function HomeCategoryGrid({
  title,
  categories,
  onSelectCategory,
}: {
  title: string;
  categories: Array<{ id: string; label: string; query: string; image?: any }>;
  onSelectCategory: (categoryQuery: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.categoryGrid}>
        {categories.map((c) => (
          <Card
            key={c.id}
            style={[
              styles.categoryTile,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            onPress={() => onSelectCategory(c.query)}
            accessibilityLabel={`Shop category ${c.label}`}
          >
            {c.image ? (
              <Card.Cover source={c.image} style={styles.categoryTileImage} />
            ) : null}
            <Card.Content style={styles.categoryTileContent}>
              <Text variant="titleMedium" style={{ fontWeight: "900" }}>
                {c.label}
              </Text>
              <Text style={{ opacity: 0.7 }}>Explore</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryTile: { width: "48%", borderRadius: 14 },
  categoryTileImage: { height: 110 },
  categoryTileContent: { paddingTop: 10, gap: 2 },
});
