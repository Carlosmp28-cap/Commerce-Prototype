import { memo } from "react";
import type { Category } from "../../../data/catalog";
import { ScrollView } from "react-native";
import { Chip, Searchbar, useTheme as usePaperTheme } from "react-native-paper";

import { HOME_STRINGS } from "../homeStrings";
import { styles } from "./HomeSearch.styles";

function HomeSearchComponent({
  query,
  onChangeQuery,
  onSubmit,
  categories,
  onSelectCategory,
}: {
  query: string;
  onChangeQuery: (q: string) => void;
  onSubmit: () => void;
  categories: Category[];
  onSelectCategory: (categoryQuery: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <>
      <Searchbar
        placeholder={HOME_STRINGS.searchPlaceholder}
        value={query}
        onChangeText={onChangeQuery}
        onSubmitEditing={onSubmit}
        onIconPress={onSubmit}
        style={[
          styles.searchbar,
          { backgroundColor: paperTheme.colors.surface },
        ]}
        inputStyle={{ color: paperTheme.colors.onSurface }}
        elevation={0}
        accessibilityLabel={HOME_STRINGS.searchA11y}
        returnKeyType="search"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        accessibilityLabel="Categories"
      >
        {categories.map((c) => (
          <Chip
            key={c.id}
            onPress={() => onSelectCategory(c.query)}
            style={[
              styles.chip,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            accessibilityLabel={`${HOME_STRINGS.categoryChipA11yPrefix} ${c.label}`}
            mode="outlined"
          >
            {c.label}
          </Chip>
        ))}
      </ScrollView>
    </>
  );
}

export const HomeSearch = memo(HomeSearchComponent);
