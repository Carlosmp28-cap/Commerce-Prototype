import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useTheme } from "../../../themes";
import Text from "../../../components/Text";
import type { CategoryNodeDto } from "../../../models";

type Props = {
  subcategories: CategoryNodeDto[];
  onSelectCategory: (categoryId: string) => void;
};

export default function SubcategoryChips({
  subcategories,
  onSelectCategory,
}: Props) {
  const theme = useTheme();

  if (!subcategories || subcategories.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: theme.colors.text,
          marginBottom: 8,
        }}
      >
        Subcategories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
      >
        {subcategories.map((subCat) => (
          <Pressable
            key={subCat.id}
            onPress={() => onSelectCategory(subCat.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${subCat.name}`}
            style={({ pressed }) => [
              {
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: pressed
                  ? theme.colors.primaryContainer
                  : theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Text style={{ fontSize: 13, color: theme.colors.text }}>
              {subCat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
