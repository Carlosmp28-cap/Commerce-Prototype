import { Text, View } from "react-native";
import CustomButton from "./components/Button";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello!</Text>
      

<CustomButton title="Salvar" size="large" variantType="primary" onPress={() => console.log("Salvar")} />
<CustomButton title="Cancelar" size="small" variantType="secondary" mode="outlined" />
<CustomButton title="Apagar" size="medium" variantType="danger" disabled />
    </View>
  );
}
