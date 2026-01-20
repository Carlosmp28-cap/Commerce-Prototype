import { View } from "react-native";
import { usePLPHeaderLogic } from "./shared/usePLPHeaderLogic";
import type { PLPHeaderProps } from "./shared/types/PLPHeaderProps";
import { PLPHeaderWebTitle, PLPHeaderWebControls } from "./web/components";
import { styles } from "./web/styles/PLPHeader.web.styles";

/**
 * PLPHeader for Web
 * Uses react-native-paper Menu component for dropdown menus
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
    selectedOption,
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
      <View style={styles.topRow}>
        <PLPHeaderWebTitle
          title={title}
          countText={countText}
          titleStyle={titleStyle}
          countStyle={countStyle}
          onBackPress={onBackPress}
        />

        <PLPHeaderWebControls
          filterVisible={filterVisible}
          sortVisible={sortVisible}
          selectedOption={selectedOption}
          selectedSort={selectedSort}
          selectedCategory={query}
          openFilterMenu={openFilterMenu}
          closeFilterMenu={closeFilterMenu}
          openSortMenu={openSortMenu}
          closeSortMenu={closeSortMenu}
          handleFilterSelect={handleFilterSelect}
          handleSortSelect={handleSortSelect}
        />
      </View>
    </View>
  );
}
