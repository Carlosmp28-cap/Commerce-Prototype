import React from "react";
import { Button } from "react-native-paper";

interface ButtonCheckoutProps {
  onPress: () => void;
  title: string;
}

export default function ButtonCheckout({
  onPress,
  title,
}: ButtonCheckoutProps) {
  return (
    <Button
      icon="cart-check"
      mode="contained"
      onPress={onPress}
      style={{ marginBottom: 10 }}
      buttonColor="#007AFF"
    >
      {title}
    </Button>
  );
}
