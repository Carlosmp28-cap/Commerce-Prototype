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
      
<CustomButton size="large" variantType="primary">
  Apagar
</CustomButton>

<CustomButton size="small" variantType="secondary">
  Cancelar
</CustomButton>
    </View>
  );
}
