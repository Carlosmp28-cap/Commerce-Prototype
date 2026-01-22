import { View, type TextStyle } from "react-native";
import Text from "../../../../components/Text";
import { styles } from "../PLPHeader.styles";

/**
 * Header title section with back button and product count
 * @param title - The title to display
 * @param countText - The product count text to display
 * @param titleStyle - Style for the title text
 * @param countStyle - Style for the count text
 */
interface PLPHeaderTitleProps {
  title: string;
  countText: string;
  titleStyle: TextStyle;
  countStyle: TextStyle;
}

/**
 * Header title section with back button and product count
 */
export default function PLPHeaderTitle({
  title,
  countText,
  titleStyle,
  countStyle,
}: PLPHeaderTitleProps) {
  return (
    <View style={styles.topRow}>
      <View style={styles.titleContainer}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={countStyle}>{countText}</Text>
      </View>
    </View>
  );
}
