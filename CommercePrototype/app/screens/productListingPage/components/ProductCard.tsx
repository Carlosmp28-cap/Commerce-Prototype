import {
  Image,
  TouchableOpacity,
  type ImageStyle,
  type ViewStyle,
} from "react-native";
// The UI accepts backend-backed `Product` model; legacy `CatalogProduct` is
// no longer used at runtime. Keep types broad enough for tests/fixtures.
import type { Product } from "../../../models/Product";
import { useCategories, findCategoryById } from "../../../hooks/useCategories";
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
  product: Product | any;
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
  const { categories: categoryTree } = useCategories();
  const categoryNode = findCategoryById(categoryTree, product.categoryId);
  const categoryLabel = categoryNode?.name || "Unknown";

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
