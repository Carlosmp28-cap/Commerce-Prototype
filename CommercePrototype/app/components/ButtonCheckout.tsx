import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "../screens/Cart.styles";

interface ButtonCheckoutProps {
  onPress: () => void;
  title: string;
}

export default function ButtonCheckout({
  onPress,
  title,
}: ButtonCheckoutProps) {
  return (
    <TouchableOpacity style={styles.checkoutBtn} onPress={onPress}>
      <Text style={styles.checkoutBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}
