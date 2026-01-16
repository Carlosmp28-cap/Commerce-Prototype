import { View, type TextStyle } from "react-native";
import { IconButton } from "react-native-paper";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import { styles } from "../PLPHeader.styles";

/**
 * Header title section with back button and product count
 * @param title - The title to display
 * @param countText - The product count text to display
 * @param titleStyle - Style for the title text
 * @param countStyle - Style for the count text
 * @param onBackPress - Callback when back button is pressed
 */
interface PLPHeaderTitleProps {
  title: string;
  countText: string;
  titleStyle: TextStyle;
  countStyle: TextStyle;
  onBackPress: () => void;
}

/**
 * Header title section with back button and product count
 */
export function PLPHeaderTitle({ title, countText, titleStyle, countStyle, onBackPress }: PLPHeaderTitleProps) {
  
    const theme = useTheme();

    return (
        <View style={styles.topRow}>
            <IconButton
                icon="arrow-left"
                size={24}
                onPress={onBackPress}
                iconColor={theme.colors.text}
                style={styles.backButton}
                accessibilityLabel="Go back"
                accessibilityRole="button"
            />
            
            <View style={styles.titleContainer}>
                <Text style={titleStyle}>{title}</Text>
                <Text style={countStyle}>{countText}</Text>
            </View>
        </View>
    );
}
