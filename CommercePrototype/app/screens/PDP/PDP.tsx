import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  useWindowDimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
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

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Hybrid behavior:
  // - If there's exactly one orderable variant, auto-select it.
  // - If multiple, require selection.
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setSelectedVariantId(null);
      return;
    }

    const orderable = product.variants.filter((v) => v.orderable !== false);
    if (orderable.length === 1) {
      setSelectedVariantId(orderable[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product?.id]);

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
    if (!product) return;

    const hasVariants = Boolean(
      product.variants && product.variants.length > 0,
    );
    if (hasVariants && !selectedVariantId) {
      alert("Please select a variant (e.g. size/color) before adding to cart.");
      return;
    }

    const productForCart: Product = selectedVariantId
      ? { ...product, id: selectedVariantId }
      : product;

    addItem(productForCart, quantity);
  };

  // SEO: Meta tags dinâmicas para cada produto
  useMetaTags({
    title: `${product.name} - Commerce Prototype`,
    description: `Buy ${product.name} for €${product.price.toFixed(2)}. ${product.description || "High-quality product available now."} Shop online with fast delivery.`,
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

      {product.variants && product.variants.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "700",
              marginBottom: 6,
            }}
          >
            Choose variant
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
            }}
          >
            <Picker
              selectedValue={selectedVariantId ?? ""}
              onValueChange={(value) =>
                setSelectedVariantId(value ? String(value) : null)
              }
            >
              <Picker.Item label="Select…" value="" />
              {product.variants.map((v) => {
                const label = v.variationValues
                  ? Object.entries(v.variationValues)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(" • ")
                  : v.id;
                return <Picker.Item key={v.id} label={label} value={v.id} />;
              })}
            </Picker>
          </View>
        </View>
      )}

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
