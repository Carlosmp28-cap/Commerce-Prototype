import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../../themes";
import type { RootStackParamList } from "../../navigation";
import type { Product } from "../../models/Product";
import { useProductDetail, useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import { useMetaTags } from "../../hooks/useMetaTags";
import Text from "../../components/Text";
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

function getImageUri(image: Product["image"]): string | undefined {
  if (!image) return undefined;
  if (typeof image === "number") return undefined;
  if (typeof image === "object" && "uri" in image) {
    const uri = (image as { uri?: unknown }).uri;
    return typeof uri === "string" ? uri : undefined;
  }
  return undefined;
}

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { addItem } = useCart();
  const { id } = route.params;
  const { width } = useWindowDimensions();

  const isDesktop = width > 768;

  // Fetch product details from API
  const { product, loading, error } = useProductDetail(id);

  // Fetch related products from the same category
  const { products: relatedProducts } = useProducts(
    product?.categoryId || "",
    undefined,
    10,
  );

  const filteredRelated = useMemo(() => {
    if (!product) return [];
    return relatedProducts.filter((p) => p.id !== product.id).slice(0, 10);
  }, [product, relatedProducts]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    // Always put the main product image first (this is what PLP uses).
    // Then append the gallery images, de-duping any that match the main image.
    const mainImage = product.image ? [product.image] : [];
    const mainUri = getImageUri(product.image);

    const gallery = (product.images ?? []).filter((img) => {
      const uri = getImageUri(img);
      return mainUri ? uri !== mainUri : true;
    });

    return mainImage.length > 0 ? [...mainImage, ...gallery] : gallery;
  }, [product]);

  const handleAddToCart = (quantity: number) => {
    if (product) {
      addItem(product, quantity);
    }
  };

  // SEO: Meta tags dinâmicas para cada produto
  useMetaTags({
    title: `${product.name} - Commerce Prototype`,
    description: `Buy ${product.name} for €${product.price.toFixed(2)}. ${product.description || "High-quality product available now."} Shop online with fast delivery.`,
    keywords: `${product.name}, ${product.categoryId}, ecommerce, online shopping`,
    ogTitle: product.name,
    ogDescription: `${product.name} - €${product.price.toFixed(2)}`,
  });

  // Show loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>
          Loading product details...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {error || "Product not found"}
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          Please check that the backend is running at http://localhost:5035
        </Text>
      </View>
    );
  }

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

      <PDPRelatedProducts products={filteredRelated} navigation={navigation} />
    </ScrollView>
  );
}
