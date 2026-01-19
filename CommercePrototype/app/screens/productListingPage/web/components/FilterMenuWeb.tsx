import { View } from "react-native";
import { Menu, Button, Divider } from "react-native-paper";
import { useTheme } from "../../../../themes";
import { categories } from "../../../../data/catalog";
import { styles } from "../styles/PLPHeader.web.styles";

interface FilterMenuWebProps {
  visible: boolean;
  onDismiss: () => void;
  onOpen: () => void;
  selectedCategory?: string;
  handleFilterSelect: (query: string) => void;
}

export function FilterMenuWeb({ visible, onDismiss, onOpen, selectedCategory, handleFilterSelect }: FilterMenuWebProps) {
  const theme = useTheme();
  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={
        <Button
          mode="outlined"
          onPress={onOpen}
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
      {categories.map((category: any, index: number) => (
        <View key={category.id}>
          <Menu.Item
            onPress={() => handleFilterSelect(category.query)}
            title={category.label}
            titleStyle={
              selectedCategory === category.query
                ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
                : undefined
            }
          />
          {index < categories.length - 1 && <Divider />}
        </View>
      ))}
      <Divider />
      <Menu.Item
        onPress={() => handleFilterSelect("")}
        title="All Products"
        titleStyle={
          selectedCategory === "" || !selectedCategory
            ? [styles.menuItemTitleBold, { color: theme.colors.primary }]
            : undefined
        }
      />
    </Menu>
  );
}
