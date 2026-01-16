import { StyleSheet } from "react-native";

/**
 * Styles for PLPHeader component
 */
export const styles = StyleSheet.create({
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        position: "relative",
    },
    backButton: {
        margin: 0,
        position: "absolute",
        left: 0,
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
        paddingLeft: 12,
    },
    controlRow: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        height: 44,
        justifyContent: "center",
        borderWidth: 1.5,
    },
    buttonContent: {
        flexDirection: "row-reverse",
        paddingHorizontal: 12,
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginHorizontal: 4,
    },
});
