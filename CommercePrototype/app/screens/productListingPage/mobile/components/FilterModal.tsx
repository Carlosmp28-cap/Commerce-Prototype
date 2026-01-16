import { Modal, TouchableOpacity, View, ScrollView } from "react-native";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import { categories } from "../../../../data/catalog";
import { styles } from "./FilterModal.styles";

/**
 * Props for the FilterModal component
 * @property {boolean} visible - Controls whether the modal is visible
 * @property {() => void} onClose - Callback triggered when the modal should be closed
 * @property {(query: string) => void} onSelect - Callback triggered when a category is selected
 */
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (query: string) => void;
  selectedQuery?: string;
}

/**
 * Modal for filtering products by category
 *
 * Features:
 * - Displays list of available product categories
 * - Includes "All Products" option to show unfiltered results
 * - Responsive design that centers on screen
 * - Full accessibility support with labels and roles
 * - Closes when clicking outside the modal or on close button
 *
 * @param {FilterModalProps} props - Component properties
 * @returns {JSX.Element} Modal component with category filter options
 */
export function FilterModal({ visible, onClose, onSelect, selectedQuery }: FilterModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityLabel="Filter by category modal"
      accessible={true}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.modalOverlay}
        accessible={true}
        accessibilityLabel="Close filter modal"
        accessibilityHint="Double tap to close"
      >
        <View
          pointerEvents="box-none"
          style={[styles.modalContentCenter, { backgroundColor: theme.colors.background }]}
          accessible={true}
        >
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.text }]}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.text }]}
              accessible={true}
              accessibilityRole="header"
            >
              Filter by Category
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              accessibilityHint="Double tap to close"
            >
              <Text style={[styles.closeText, { color: theme.colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            accessible={true}
            accessibilityRole="list"
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  index === categories.length - 1
                    ? styles.modalItemLast
                    : styles.modalItem,
                  { borderBottomColor: theme.colors.text }
                ]}
                onPress={() => onSelect(category.query)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${category.label}`}
                accessibilityState={{ selected: selectedQuery === category.query }}
                accessibilityHint={selectedQuery === category.query ? "Currently selected" : "Double tap to apply filter"}
              >
                <Text
                  style={[
                    selectedQuery === category.query
                      ? [styles.modalItemTextSelected, { color: theme.colors.primary }]
                      : [styles.modalItemTextDefault, { color: theme.colors.text }]
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View
              style={[
                styles.modalItem,
                { borderBottomColor: theme.colors.text, paddingVertical: 0, height: 1 }
              ]}
            />

            <TouchableOpacity
              style={[styles.modalItemLast]}
              onPress={() => onSelect("")}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Show all products"
              accessibilityState={{ selected: !selectedQuery }}
              accessibilityHint={!selectedQuery ? "Currently selected" : "Double tap to remove filter"}
            >
              <Text
                style={[
                  !selectedQuery
                    ? [styles.modalItemTextSelected, { color: theme.colors.primary }]
                    : [styles.modalItemTextDefault, { color: theme.colors.text }]
                ]}
              >
                All Products
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
