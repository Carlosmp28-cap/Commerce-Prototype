import React from "react";
import { View, Text, Button } from "react-native";

// Tela Home: painel inicial, destaques, navegação para PLP.
// TODO: conectar com a store/serviço para mostrar banners/produtos.
export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen (implement here)</Text>
      <Button title="Ver produtos" onPress={() => navigation.navigate("PLP")} />
    </View>
  );
}
