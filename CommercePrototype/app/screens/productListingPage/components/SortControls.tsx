import { useState } from "react";
import { View } from "react-native";
import { Menu, Button, Divider } from "react-native-paper";
import Text from "../../../components/Text";
import { useTheme } from "../../../themes";
import type { SortOption } from "../../../scripts/helpers/productHelpers";
import { SORT_OPTIONS } from "../../../scripts/helpers/productHelpers";
import { categories } from "../../../data/catalog";
import { styles } from "./SortControls.styles";

/**
 * Sort and filter controls component for product listing page
 * @param selectedSort - Currently selected sort option
 * @param onSortChange - Callback when sort option changes
 * @param onCategorySelect - Callback when category filter changes
 */
type SortControlsProps = {
    selectedSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    onCategorySelect: (query: string) => void;
};

/**
 * Sort and filter controls component for product listing page
 * @param {SortControlsProps} props - Component props
 * @returns {JSX.Element} Sort and filter controls UI
 */
export default function SortControls({ selectedSort, onSortChange, onCategorySelect }: SortControlsProps) {
  const theme = useTheme();
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === selectedSort);

  const openSortMenu = () => setSortVisible(true);
  const closeSortMenu = () => setSortVisible(false);

  const openFilterMenu = () => setFilterVisible(true);
  const closeFilterMenu = () => setFilterVisible(false);

  const handleSortSelect = (value: SortOption) => {
    onSortChange(value);
    closeSortMenu();
  };

  const handleFilterSelect = (query: string) => {
    onCategorySelect(query);
    closeFilterMenu();
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.text }]}>
      <View style={styles.buttonsRow}>
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
                leadingIcon="tag"
              />
              {index < categories.length - 1 && <Divider />}
            </View>
          ))}
          <Divider />
          <Menu.Item
            onPress={() => handleFilterSelect("")}
            title="All Products"
            leadingIcon="view-grid"
            titleStyle={styles.menuItemTitleBold}
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
          {SORT_OPTIONS.map((option) => (
            <View key={option.value}>
              <Menu.Item
                onPress={() => handleSortSelect(option.value)}
                title={option.label}
                leadingIcon={selectedSort === option.value ? "check" : undefined}
                titleStyle={
                  selectedSort === option.value
                    ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
                    : undefined
                }
              />
            </View>
          ))}
        </Menu>
      </View>
    </View>
  );
}
