import { View } from "react-native";
import { PLPHeaderTitle, PLPHeaderMobileControls } from "./mobile/components";
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

      <PLPHeaderMobileControls
        selectedSort={selectedSort}
        selectedCategory={query}
        handleFilterSelect={handleFilterSelect}
        handleSortSelect={handleSortSelect}
      />
    </View>
  );
}
