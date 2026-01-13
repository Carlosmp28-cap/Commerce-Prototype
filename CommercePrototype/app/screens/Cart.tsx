import React from "react";
import { View, Text, Button } from "react-native";

// Tela Cart: mostrar itens, total, ações (update qty / remove / checkout).
// TODO: conectar com CartContext/useCart para persistência e reidratação.
export default function CartScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Cart (implement cart UI and actions)</Text>
      <Button
        title="Checkout"
        onPress={() => {
          /* TODO: navegar para Checkout */
        }}
      />
    </View>
  );
}
