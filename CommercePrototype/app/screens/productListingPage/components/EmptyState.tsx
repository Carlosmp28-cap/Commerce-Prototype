import { View, type ViewStyle, type TextStyle } from "react-native";
import Text from "../../../components/Text";
import { styles } from "./EmptyState.styles";

/**
 * Props for the EmptyState component
 * @property {string} [query] - Optional search query to display in the message
 * @property {ViewStyle} containerStyle - Style for the container View
 * @property {TextStyle} textStyle - Style for the text elements
 */
export interface EmptyStateProps {
  query?: string;
  containerStyle: ViewStyle;
  textStyle: TextStyle;
}

/**
 * EmptyState component displayed when no products are found
 * Shows contextual message based on whether user searched for something specific
 *
 * @param props - Component properties
 * @returns Empty state UI with appropriate message
 */
export function EmptyStateView({ query, containerStyle, textStyle } : EmptyStateProps) {
  
  const message = query
    ? `No products found for "${query}"`
    : "No products found";

  return (
    <View
      style={containerStyle}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Text style={textStyle}>{message}</Text>
      <Text style={[textStyle, styles.suggestionText]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );
}

export default EmptyStateView;
