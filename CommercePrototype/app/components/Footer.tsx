import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Divider, Surface, Text, useTheme } from "react-native-paper";

export const FOOTER_BASE_HEIGHT = 56;

export default function Footer() {
  const insets = useSafeAreaInsets();
  const paperTheme = useTheme();

  // Ensure the footer never hugs the iOS home indicator (or Android gesture bar).
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Surface
      elevation={0}
      style={[
        styles.container,
        {
          backgroundColor: paperTheme.colors.surface,
          paddingBottom: bottomInset,
          minHeight: FOOTER_BASE_HEIGHT + bottomInset,
        },
      ]}
    >
      <Divider />
      <View style={styles.content}>
        <Text style={styles.text}>
          © {new Date().getFullYear()} Commerce Prototype
        </Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  text: {
    opacity: 0.75,
    fontSize: 12,
  },
});
