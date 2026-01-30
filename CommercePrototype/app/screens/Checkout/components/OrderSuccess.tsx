import { View, StyleSheet } from "react-native";
import {
  Title,
  Paragraph,
  Button,
  Avatar,
  useTheme as usePaperTheme,
} from "react-native-paper";

type Props = {
  onReturnHome: () => void;
  orderId?: string;
};

export default function OrderSuccess({ onReturnHome, orderId }: Props) {
  const paper = usePaperTheme();

  return (
    <View style={styles.container}>
      <Avatar.Icon
        size={80}
        icon="check"
        style={{ backgroundColor: paper.colors.primary, marginBottom: 16 }}
        accessibilityLabel="Order success icon"
      />
      <Title style={{ textAlign: "center", marginBottom: 8 }}>
        Order completed
      </Title>
      <Paragraph
        style={{
          textAlign: "center",
          color: paper.colors.onSurfaceVariant,
          marginBottom: 16,
        }}
      >
        Thank you for your purchase. Your order {orderId ? `(${orderId}) ` : ""}{" "}
        has been placed successfully.
      </Paragraph>

      <Button
        mode="contained"
        onPress={onReturnHome}
        accessibilityLabel="Return to Home"
        style={{ alignSelf: "stretch", marginHorizontal: 24 }}
      >
        Return to Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
