import {
  Image,
  TouchableOpacity,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
import type { CatalogProduct } from "../../../data/catalog";
import type { Product } from "../../../models/Product";
import { categories } from "../../../data/catalog";
import { useTheme } from "../../../themes";
import Card from "../../../components/Card";
import Text from "../../../components/Text";
import { styles } from "./ProductCard.styles";

/**
 * Props for ProductCard
 * @property {Product | CatalogProduct} product - Product data to render
 * @property {() => void} onPress - Callback fired when the card is pressed
 * @property {any} imageStyle - Style object applied to the product image
 * @property {any} containerStyle - Style object applied to the card container
 */
type ProductCardProps = {
  product: Product | CatalogProduct;
  onPress: () => void;
  imageStyle: ImageStyle;
  containerStyle: ViewStyle;
};

/**
 * ProductCard
 * Renders a product card with image, name, category, price and stock state.
 *
 * @param {ProductCardProps} props - Component props
 * @returns {JSX.Element} Product card UI
 */
export default function ProductCard({
  product,
  onPress,
  imageStyle,
  containerStyle,
}: ProductCardProps) {
  const theme = useTheme();
  const inStock = product.quantityAvailable > 0;
  const categoryLabel =
    categories.find((c) => c.id === product.categoryId)?.label || "Unknown";

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={`View ${product.name}`}
      style={containerStyle}
      activeOpacity={0.7}
    >
      <Card>
        <Image
          source={product.image}
          style={imageStyle}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={`Product image of ${product.name}`}
        />
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text
          style={[styles.category, { color: theme.colors.text, opacity: 0.7 }]}
        >
          {categoryLabel}
        </Text>
        <Text style={styles.price}>€{product.price.toFixed(2)}</Text>
        <Text
          style={[
            styles.stock,
            {
              color: inStock ? theme.colors.primary : theme.colors.text,
              opacity: inStock ? 1 : 0.7,
            },
          ]}
        >
          {inStock ? "Available" : "Out of stock"}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}
