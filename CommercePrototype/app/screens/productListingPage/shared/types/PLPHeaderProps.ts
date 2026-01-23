import type { ViewStyle, TextStyle } from "react-native";
import type { SortOption } from "../../../../scripts/helpers/productHelpers";

/**
 * Shared props for PLPHeader component
 */
export interface PLPHeaderProps {
  query?: string;
  productCount: number;
  headerStyle: ViewStyle;
  titleStyle: TextStyle;
  countStyle: TextStyle;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCategorySelect: (categoryId: string) => void;
}
