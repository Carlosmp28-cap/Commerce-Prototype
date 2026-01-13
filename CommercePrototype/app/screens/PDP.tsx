import React from "react";
import { View, Text, Button } from "react-native";

// Product Details Page (PDP): mostra detalhes do produto e botão 'Adicionar ao carrinho'.
// TODO: usar useApi() para buscar detalhes por ID (route.params.id) e habilitar variantes.
export default function PDPScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>PDP - Product ID: {id}</Text>
      <Button
        title="Adicionar ao carrinho"
        onPress={() => navigation.navigate("Cart")}
      />
    </View>
  );
}
