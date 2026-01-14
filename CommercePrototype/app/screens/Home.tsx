import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

// Tela Home: painel inicial, destaques, navegação para PLP.
// TODO: conectar com a store/serviço para mostrar banners/produtos.
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen (implement here)</Text>
      <Button title="Ver produtos" onPress={() => router.push("screens/PLP")} />
      <Button title="Go to Cart" onPress={() => router.push("screens/Cart")} />
    </View>
  );
}
