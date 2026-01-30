import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import Text from "../../../../components/Text";
import { Icon } from "react-native-paper";
import { useTheme } from "../../../../themes";
import { styles, ICON_SIZE } from "../PLPHeader.styles";
import FilterModal from "./FilterModal";
import SortModal from "./SortModal";
import type { SortOption } from "../../../../types";

interface PLPHeaderMobileControlsProps {
  selectedSort: SortOption;
  selectedCategory?: string;
  handleFilterSelect: (query: string) => void;
  handleSortSelect: (value: SortOption) => void;
}

export function PLPHeaderMobileControls({
  selectedSort,
  selectedCategory,
  handleFilterSelect,
  handleSortSelect,
}: PLPHeaderMobileControlsProps) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const theme = useTheme();

  return (
    <View
      style={styles.controlRow}
      accessibilityRole="toolbar"
      accessibilityLabel="Product filtering and sorting controls"
    >
      <TouchableOpacity
        style={[styles.button, { flex: 1 }]}
        onPress={() => setFilterVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open filter options"
        accessibilityHint="Double tap to open filter options"
      >
        <Text style={styles.buttonLabel}>Categories</Text>
        <Icon source="tune" color={theme.colors.primary} size={ICON_SIZE} />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={[styles.button, { flex: 1, justifyContent: "center" }]}
        onPress={() => setSortVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Open sort options"
        accessibilityHint="Double tap to open sort options"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={styles.buttonLabel}>Sort</Text>
          <Icon
            source="sort-alphabetical-variant"
            color={theme.colors.primary}
            size={ICON_SIZE}
          />
        </View>
      </TouchableOpacity>
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSelect={(query) => {
          handleFilterSelect(query);
          setFilterVisible(false);
        }}
        selectedQuery={selectedCategory}
      />
      <SortModal
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        onSelect={(value) => {
          handleSortSelect(value);
          setSortVisible(false);
        }}
        selectedSort={selectedSort}
      />
    </View>
  );
}
