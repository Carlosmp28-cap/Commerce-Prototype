import { View, type TextStyle } from "react-native";
import Text from "../../../../components/Text";
import { styles } from "../styles/PLPHeader.web.styles";

interface PLPHeaderWebTitleProps {
  title: string;
  countText: string;
  titleStyle?: TextStyle | TextStyle[];
  countStyle?: TextStyle | TextStyle[];
}

/**
 * Header title section for web version
 */
export function PLPHeaderWebTitle({
  title,
  countText,
  titleStyle,
  countStyle,
}: PLPHeaderWebTitleProps) {
  return (
    <>
      <View style={styles.titleContainer}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={countStyle}>{countText}</Text>
      </View>
    </>
  );
}
