import { View } from "react-native";
import { PLPHeaderTitle } from "./mobile/components/PLPHeaderTitle";
import { PLPHeaderControls } from "./mobile/components/PLPHeaderControls";
import { FilterModal } from "./mobile/components/FilterModal";
import { SortModal } from "./mobile/components/SortModal";
import { usePLPHeaderLogic } from "./shared/usePLPHeaderLogic";
import type { PLPHeaderProps } from "./shared/types/PLPHeaderProps";

/**
 * PLPHeader for Native
 * Renders the page header (title + count), action controls, and manages Sort/Filter modals.
 */
export default function PLPHeader({
  query,
  productCount,
  headerStyle,
  titleStyle,
  countStyle,
  onBackPress,
  selectedSort,
  onSortChange,
  onCategorySelect,
}: PLPHeaderProps) {
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
    <View 
      style={headerStyle}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel="Product Listing Page Header"
    >
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
        selectedQuery={query}
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
