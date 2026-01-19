export const ICON_SIZE = 18;
import { StyleSheet } from "react-native";
import { sharedStyles } from "../styles/PLPHeader.shared.styles";

export const styles = StyleSheet.create({
    ...sharedStyles,
    topRow: {
        ...sharedStyles.topRow,
        paddingVertical: 12,
    },
    backButton: {
        margin: 0,
        position: "absolute",
        left: 0,
    },
    titleContainer: {
        ...sharedStyles.titleContainer,
        paddingHorizontal: 16,
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1a237e',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        minWidth: 120,
        minHeight: 40,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonContent: {
        ...sharedStyles.buttonContent,
        paddingHorizontal: 12,
    },
    buttonLabel: {
        color: '#1a237e',
        fontWeight: '500',
        fontSize: 15,
        marginRight: 6,
    },
    buttonIcon: {
        color: '#1a237e',
        fontSize: 18,
        marginLeft: 4,
    },
});
