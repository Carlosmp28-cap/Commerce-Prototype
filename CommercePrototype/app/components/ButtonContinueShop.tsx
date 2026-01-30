import { Button } from "react-native-paper";

interface ButtonContinueShopProps {
  onPress: () => void;
  title: string;
}

export default function ButtonContinueShop({
  onPress,
  title,
}: ButtonContinueShopProps) {
  return (
    <Button
      icon="shopping"
      mode="outlined"
      onPress={onPress}
      textColor="#000000"
    >
      {title}
    </Button>
  );
}
