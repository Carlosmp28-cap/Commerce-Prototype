import { View } from "react-native";

import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import { styles } from "../styles/PLPHeader.web.styles";
import { FilterMenuWeb } from "./FilterMenuWeb";
import { SortMenuWeb } from "./SortMenuWeb";
import type { SortOption } from "../../../../types";

interface PLPHeaderWebControlsProps {
  filterVisible: boolean;
  sortVisible: boolean;
  selectedOption: { label: string; value: SortOption } | undefined;
  selectedSort: SortOption;
  selectedCategory?: string;
  openFilterMenu: () => void;
  closeFilterMenu: () => void;
  openSortMenu: () => void;
  closeSortMenu: () => void;
  handleFilterSelect: (query: string) => void;
  handleSortSelect: (value: SortOption) => void;
}

/**
 * Controls section for web version with dropdown menus
 */
export function PLPHeaderWebControls({
  filterVisible,
  sortVisible,
  selectedOption,
  selectedSort,
  selectedCategory,
  openFilterMenu,
  closeFilterMenu,
  openSortMenu,
  closeSortMenu,
  handleFilterSelect,
  handleSortSelect,
}: PLPHeaderWebControlsProps) {
  const theme = useTheme();

  return (
    <View style={styles.controlsContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Filter By:
      </Text>
      <FilterMenuWeb
        visible={filterVisible}
        onDismiss={closeFilterMenu}
        onOpen={openFilterMenu}
        selectedCategory={selectedCategory}
        handleFilterSelect={handleFilterSelect}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Sort by:</Text>
      <SortMenuWeb
        visible={sortVisible}
        onDismiss={closeSortMenu}
        onOpen={openSortMenu}
        selectedSort={selectedSort}
        selectedOption={selectedOption}
        handleSortSelect={handleSortSelect}
      />
    </View>
  );
}
