import { StyleSheet } from "react-native";

/**
 * Styles for SortModal component
 */
export const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContentCenter: {
        width: "90%",
        maxWidth: 400,
        borderRadius: 12,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        fontSize: 24,
        fontWeight: "300",
    },
    modalScroll: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    modalItemLast: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 0,
    },
    modalItemTextSelected: {
        color: "primary",
        fontWeight: "600",
        fontSize: 14,
    },
    modalItemTextDefault: {
        fontSize: 14,
    },
});
