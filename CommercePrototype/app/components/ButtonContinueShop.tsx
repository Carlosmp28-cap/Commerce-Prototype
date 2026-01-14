import React from "react";
import { Text, TouchableOpacity } from "react-native";
import styles from "../screens/Cart.styles";

interface ButtonContinueShopProps {
  onPress: () => void;
  title: string;
}

export default function ButtonContinueShop({
  onPress,
  title,
}: ButtonContinueShopProps) {
  return (
    <TouchableOpacity style={styles.continueShoppingBtn} onPress={onPress}>
      <Text style={styles.continueShoppingBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}
