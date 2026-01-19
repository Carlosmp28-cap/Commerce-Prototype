import React, { useMemo } from "react";
import { View, ScrollView, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../../themes";
import type { RootStackParamList } from "../../navigation";
import type { Product } from "../../models/Product";
import { getProductById, products } from "../../data/catalog";
import { useCart } from "../../hooks/useCart";
import { useMetaTags } from "../../hooks/useMetaTags";
import { styles } from "./PDP.styles";
import {
  PDPBreadcrumb,
  PDPImageGallery,
  PDPProductInfo,
  PDPProductInfoHeader,
  PDPProductInfoDetail,
  PDPQuantitySelector,
  PDPRelatedProducts,
} from "./components";

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { addItem } = useCart();
  const { id } = route.params;
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  const product = useMemo((): Product => {
    return (
      getProductById(id) ?? {
        id,
        name: `Product ${id}`,
        price: 39.99,
        quantityAvailable: 0,
        categoryId: "new",
      }
    );
  }, [id]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 10);
  }, [product]);

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  const handleAddToCart = (quantity: number) => {
    addItem(product, quantity);
  };

  // SEO: Meta tags dinâmicas para cada produto
  useMetaTags({
    title: `${product.name} - Commerce Prototype`,
    description: `Buy ${product.name} for €${product.price.toFixed(2)}. ${product.description || 'High-quality product available now.'} Shop online with fast delivery.`,
    keywords: `${product.name}, ${product.categoryId}, ecommerce, online shopping`,
    ogTitle: product.name,
    ogDescription: `${product.name} - €${product.price.toFixed(2)}`,
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <PDPBreadcrumb product={product} navigation={navigation} />

      {isDesktop ? (
        <View style={styles.contentRow}>
          <PDPImageGallery images={galleryImages} isDesktop={true} />

          <View style={styles.rightColumn}>
            <PDPProductInfo product={product} isDesktop={true} />
            <PDPQuantitySelector
              product={product}
              onAddToCart={handleAddToCart}
            />
          </View>
        </View>
      ) : (
        <>
          <PDPProductInfoHeader product={product} />
          <PDPImageGallery images={galleryImages} isDesktop={false} />
          <PDPProductInfoDetail product={product} />
          <PDPQuantitySelector
            product={product}
            onAddToCart={handleAddToCart}
          />
        </>
      )}

      <PDPRelatedProducts products={relatedProducts} navigation={navigation} />
    </ScrollView>
  );
}
