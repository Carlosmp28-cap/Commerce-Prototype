import { useMemo } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text, useTheme as usePaperTheme } from "react-native-paper";
import type { CategoryNodeDto } from "../../models";

import { styles } from "./CategoryNavMenu.styles";
import { getVisibleTopCategories } from "./CategoryNavMenu.utils";

type Props = {
  categories: CategoryNodeDto[];
  onSelectCategory: (categoryId: string) => void;
};

export default function CategoryNavMenuNative({
  categories,
  onSelectCategory,
}: Props) {
  const paperTheme = usePaperTheme();

  const visibleCategories = useMemo(
    () => getVisibleTopCategories(categories),
    [categories],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.nativeRow}
    >
      {visibleCategories.map((parent) => (
        <Pressable
          key={parent.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${parent.name}`}
          onPress={() => onSelectCategory(parent.id)}
          style={({ pressed }) => [
            styles.nativePill,
            {
              backgroundColor: paperTheme.colors.surface,
              borderColor: paperTheme.colors.outline ?? "#00000022",
            },
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Text style={{ fontWeight: 700 }}>{parent.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
