import { View } from "react-native";
import { Menu, Button, Divider } from "react-native-paper";
import { useTheme } from "../../../../themes";
import { SORT_OPTIONS } from "../../../../scripts/helpers/productHelpers";
import { styles } from "../styles/PLPHeader.web.styles";
import type { SortOption } from "../../../../scripts/helpers/productHelpers";

interface SortMenuWebProps {
  visible: boolean;
  onDismiss: () => void;
  onOpen: () => void;
  selectedSort: SortOption;
  selectedOption: { label: string; value: SortOption } | undefined;
  handleSortSelect: (value: SortOption) => void;
}

export function SortMenuWeb({ visible, onDismiss, onOpen, selectedSort, selectedOption, handleSortSelect }: SortMenuWebProps) {
  const theme = useTheme();
  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={
        <Button
          mode="outlined"
          onPress={onOpen}
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
      {SORT_OPTIONS.map((option: any, index: number) => (
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
  );
}
