import { View } from "react-native";
import { Button } from "react-native-paper";
import { useTheme } from "../../../../themes";
import { styles } from "../PLPHeader.styles";

/**
 * Props for PLPHeaderControls
 * @property onFilterPress - Invoked when the Filter button is pressed
 * @property onSortPress - Invoked when the Sort button is pressed
 */
interface PLPHeaderControlsProps {
  onFilterPress: () => void;
  onSortPress: () => void;
}

/**
 * PLPHeaderControls
 * Renders two action buttons: Filter and Sort.
 *
 * @param props Component props
 * @returns Control row with Filter and Sort buttons
 */
export function PLPHeaderControls({ onFilterPress, onSortPress }: PLPHeaderControlsProps) {
  const theme = useTheme();

  return (
    <View 
      style={styles.controlRow}
      accessible={true}
      accessibilityRole="toolbar"
      accessibilityLabel="Product filtering and sorting controls"
    >
      <Button
        mode="outlined"
        onPress={onFilterPress}
        icon="filter-variant"
        contentStyle={styles.buttonContent}
        style={[
          styles.button,
          { borderColor: theme.colors.primary }
        ]}
        labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
        compact
        accessible={true}
        accessibilityLabel="Open filter menu"
        accessibilityRole="button"
        accessibilityHint="Double tap to open filtering options"
      >
        Category
      </Button>
      
      <Button
        mode="outlined"
        onPress={onSortPress}
        icon="sort"
        contentStyle={styles.buttonContent}
        style={[
          styles.button,
          { borderColor: theme.colors.primary }
        ]}
        labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
        compact
        accessible={true}
        accessibilityLabel="Open sort menu"
        accessibilityRole="button"
        accessibilityHint="Double tap to open sorting options"
      >
        Sort
      </Button>
    </View>
  );
}
