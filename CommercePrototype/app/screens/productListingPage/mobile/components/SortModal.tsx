import { Modal, TouchableOpacity, View, ScrollView } from "react-native";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../themes";
import { SORT_OPTIONS, type SortOption } from "../../../../scripts/helpers/productHelpers";
import { styles } from "./SortModal.styles";

/**
 * Props for SortModal component
 * @property {boolean} visible - Controls whether the modal is visible
 * @property {SortOption} selectedSort - Currently selected sort option
 * @property {() => void} onClose - Callback triggered when the modal should be closed
 * @property {(sort: SortOption) => void} onSelect - Callback triggered when a sort option is selected
 */
interface SortModalProps {
    visible: boolean;
    selectedSort: SortOption;
    onClose: () => void;
    onSelect: (sort: SortOption) => void;
}

/**
 * SortModal
 * Displays a centered modal with sort options for the Product Listing Page.
 * Closes on backdrop press or the close button, and supports accessibility attributes.
 *
 * @param {SortModalProps} props - Component properties
 * @returns {JSX.Element} Modal with sort options
 */
export default function SortModal({ visible, selectedSort, onClose, onSelect }: SortModalProps) {
    const theme = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            accessibilityLabel="Sort products"
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={styles.modalOverlay}
                accessible={true}
                accessibilityLabel="Close sort modal"
                accessibilityHint="Double tap to close"
            >
                <View
                    pointerEvents="box-none"
                    style={[styles.modalContentCenter, { backgroundColor: theme.colors.background }]}
                >
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.text }]}>
                        <Text 
                            style={[styles.modalTitle, { color: theme.colors.text }]}
                            accessible={true}
                            accessibilityRole="header"
                        >
                            Sort By:
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
                        {SORT_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    index === SORT_OPTIONS.length - 1 
                                        ? styles.modalItemLast 
                                        : styles.modalItem,
                                    { borderBottomColor: theme.colors.text }
                                ]}
                                onPress={() => onSelect(option.value)}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={`Sort by ${option.label}`}
                                accessibilityState={{ selected: selectedSort === option.value }}
                                accessibilityHint={selectedSort === option.value ? "Currently selected" : "Double tap to apply"}
                            >
                                <Text
                                    style={[
                                        selectedSort === option.value
                                            ? [styles.modalItemTextSelected, { color: theme.colors.primary }]
                                            : [styles.modalItemTextDefault, { color: theme.colors.text }]
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
