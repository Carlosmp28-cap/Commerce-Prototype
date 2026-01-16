import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Chip, Searchbar, useTheme as usePaperTheme } from "react-native-paper";

export function HomeSearch({
  query,
  onChangeQuery,
  onSubmit,
  categories,
  onSelectCategory,
}: {
  query: string;
  onChangeQuery: (q: string) => void;
  onSubmit: () => void;
  categories: Array<{ id: string; label: string; query: string }>;
  onSelectCategory: (categoryQuery: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <>
      <Searchbar
        placeholder="Search products"
        value={query}
        onChangeText={onChangeQuery}
        onSubmitEditing={onSubmit}
        style={[
          styles.searchbar,
          { backgroundColor: paperTheme.colors.surface },
        ]}
        inputStyle={{ color: paperTheme.colors.onSurface }}
        elevation={0}
        accessibilityLabel="Search products"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((c) => (
          <Chip
            key={c.id}
            onPress={() => onSelectCategory(c.query)}
            style={[
              styles.chip,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            accessibilityLabel={`Open category ${c.label}`}
            mode="outlined"
          >
            {c.label}
          </Chip>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 14,
  },
  categoryRow: { gap: 8, paddingVertical: 2 },
  chip: {},
});
