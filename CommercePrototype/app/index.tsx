import HomeScreen from "./screens/Home";
export default function Index() {
  return <HomeScreen navigation={{ navigate: () => {} }} />;
}
{
  /*
import CustomButton from "./components/Button";
<CustomButton title="Salvar" size="large" variantType="primary" onPress={() => console.log("Salvar")} />
<CustomButton title="Cancelar" size="small" variantType="secondary" mode="outlined" />
<CustomButton title="Apagar" size="medium" variantType="danger" disabled /> */
}
