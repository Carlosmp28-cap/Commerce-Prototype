import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Card } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation";
import type { Product } from "../../../models/Product";
import { useTheme } from "../../../themes";

interface PDPRelatedProductsProps {
  products: Product[];
  navigation: NativeStackNavigationProp<RootStackParamList, "PDP">;
}

export default function PDPRelatedProducts({
  products,
  navigation,
}: PDPRelatedProductsProps) {
  const theme = useTheme();
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Related Products
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Open related product ${item.name}`}
            onPress={() => navigation.push("PDP", { id: item.id })}
            style={styles.item}
          >
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Image
                source={item.image}
                style={[
                  styles.image,
                  { backgroundColor: theme.colors.background },
                ]}
                resizeMode="cover"
              />
              <View style={styles.info}>
                <Text
                  style={[styles.name, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  € {item.price.toFixed(2)}
                </Text>
                {item.rating && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MaterialIcons
                      name="star"
                      size={12}
                      color={theme.colors.warning}
                    />
                    <Text style={[styles.rating, { color: theme.colors.text }]}>
                      {item.rating}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  list: {
    paddingRight: 16,
  },
  item: {
    marginRight: 12,
  },
  card: {
    width: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
  },
});
