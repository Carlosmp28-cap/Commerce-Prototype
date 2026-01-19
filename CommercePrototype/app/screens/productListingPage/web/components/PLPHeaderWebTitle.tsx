import { View } from "react-native";
import { IconButton } from "react-native-paper";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import { styles } from "../styles/PLPHeader.web.styles";

interface PLPHeaderWebTitleProps {
	title: string;
	countText: string;
	titleStyle: any;
	countStyle: any;
	onBackPress: () => void;
}

/**
 * Header title section for web version
 */
export function PLPHeaderWebTitle({
		title,
		countText,
		titleStyle,
		countStyle,
		onBackPress,
	}: PLPHeaderWebTitleProps) {
	const theme = useTheme();

	return (
		<>
			<View style={styles.backButtonContainer}>
				<IconButton
					icon="arrow-left"
					size={24}
					onPress={onBackPress}
					iconColor={theme.colors.text}
				/>
			</View>
			<View style={styles.titleContainer}>
				<Text style={titleStyle}>{title}</Text>
				<Text style={countStyle}>{countText}</Text>
			</View>
		</>
	);
}
