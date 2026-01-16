import { View } from "react-native";
import { Menu, Button, Divider } from "react-native-paper";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import type { SortOption } from "../../../../scripts/helpers/productHelpers";
import { SORT_OPTIONS } from "../../../../scripts/helpers/productHelpers";
import { categories } from "../../../../data/catalog";
import { styles } from "../styles/PLPHeader.web.styles";

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
      <Text style={[styles.label, { color: theme.colors.text }]}>Filter By:</Text>
      <Menu
        visible={filterVisible}
        onDismiss={closeFilterMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openFilterMenu}
            icon="filter-variant"
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            Categories
          </Button>
        }
        contentStyle={styles.menuContent}
        statusBarHeight={60}
      >
        {categories.map((category, index) => (
          <View key={category.id}>
            <Menu.Item
              onPress={() => handleFilterSelect(category.query)}
              title={category.label}
              titleStyle={
                selectedCategory === category.query
                  ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
                  : undefined
              }
            />
            {index < categories.length - 1 && <Divider />}
          </View>
        ))}
        <Divider />
        <Menu.Item
          onPress={() => handleFilterSelect("")}
          title="All Products"
          titleStyle={
            selectedCategory === "" || !selectedCategory
              ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
              : undefined
          }
        />
      </Menu>

      <Text style={[styles.label, { color: theme.colors.text }]}>Sort by:</Text>
      <Menu
        visible={sortVisible}
        onDismiss={closeSortMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openSortMenu}
            icon="sort"
            contentStyle={styles.buttonContent}
            style={styles.button}
          >
            {selectedOption?.label}
          </Button>
        }
        contentStyle={styles.menuContent}
        statusBarHeight={60}
      >
        {SORT_OPTIONS.map((option, index) => (
          <View key={option.value}>
            <Menu.Item
              onPress={() => handleSortSelect(option.value)}
              title={option.label}
              titleStyle={
                selectedSort === option.value
                  ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
                  : undefined
              }
            />
            {index < SORT_OPTIONS.length - 1 && <Divider />}
          </View>
        ))}
      </Menu>
    </View>
  );
}
