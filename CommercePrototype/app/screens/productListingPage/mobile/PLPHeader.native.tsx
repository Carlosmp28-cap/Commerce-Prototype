import { View } from "react-native";
import { PLPHeaderTitle } from "./components/PLPHeaderTitle";
import { PLPHeaderControls } from "./components/PLPHeaderControls";
import { FilterModal } from "./components/FilterModal";
import { SortModal } from "./components/SortModal";
import { usePLPHeaderLogic } from "../shared/usePLPHeaderLogic";
import type { PLPHeaderProps } from "../shared/types/PLPHeaderProps";

/**
 * Props for PLPHeader (Product Listing Page Header)
 * @property {string} [query] - Optional search query to display in the title
 * @property {number} productCount - Number of products to display in the count
 * @property {ViewStyle} headerStyle - Style for the header container
 * @property {TextStyle} titleStyle - Style for the title text
 * @property {TextStyle} countStyle - Style for the product count text
 * @property {() => void} onBackPress - Callback when the back button is pressed
 * @property {SortOption} selectedSort - Currently selected sort option
 * @property {(sort: SortOption) => void} onSortChange - Callback when the sort option changes
 * @property {(query: string) => void} onCategorySelect - Callback when a category filter is selected
 */
export default function PLPHeader({ query, productCount, headerStyle, titleStyle, countStyle, onBackPress, selectedSort, onSortChange, onCategorySelect }: PLPHeaderProps) {
  const {
    title,
    countText,
    sortVisible,
    filterVisible,
    openSortMenu,
    closeSortMenu,
    openFilterMenu,
    closeFilterMenu,
    handleSortSelect,
    handleFilterSelect,
  } = usePLPHeaderLogic(query, productCount, selectedSort, onSortChange, onCategorySelect);

  return (
    <View style={headerStyle}>
      <PLPHeaderTitle
        title={title}
        countText={countText}
        titleStyle={titleStyle}
        countStyle={countStyle}
        onBackPress={onBackPress}
      />

      <PLPHeaderControls
        onFilterPress={openFilterMenu}
        onSortPress={openSortMenu}
      />

      <FilterModal
        visible={filterVisible}
        onClose={closeFilterMenu}
        onSelect={handleFilterSelect}
      />

      <SortModal
        visible={sortVisible}
        selectedSort={selectedSort}
        onClose={closeSortMenu}
        onSelect={handleSortSelect}
      />
    </View>
  );
}
