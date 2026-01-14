import React, { useMemo, useState } from "react";
import { StyleSheet, View, Image, ScrollView, FlatList, TouchableOpacity, Modal, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text, Chip, IconButton } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import type { Product } from "../models/Product";
import { getProductById, products } from "../data/catalog";
import { useCart } from "../hooks/useCart";

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { addItem } = useCart();
  const { id } = route.params;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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

  // Produtos relacionados (mesma categoria, excluindo o produto atual)
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4); // Mostrar no máximo 4 produtos relacionados
  }, [product]);

  // Galeria de imagens
  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : [];

  const currentImage = galleryImages[selectedImageIndex];

  // Renderizar estrelas
  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i < Math.floor(rating) ? "star" : "star-outline"}
          size={14}
          color="#FFB800"
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const handleAddToCart = () => {
    if (product.quantityAvailable > 0 && quantity > 0) {
      setIsAdding(true);
      setTimeout(() => {
        addItem(product, quantity);
        setIsAdding(false);
        alert(`${quantity}x ${product.name} adicionado ao carrinho!`);
        setQuantity(1);
      }, 300);
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Modal de Zoom */}
      <Modal
        visible={isZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setIsZoomed(false)}
      >
        <Pressable 
          style={styles.zoomModal}
          onPress={() => setIsZoomed(false)}
        >
          <View style={styles.zoomContainer}>
            <IconButton
              icon="close"
              size={32}
              iconColor="#fff"
              onPress={() => setIsZoomed(false)}
              style={styles.closeZoomBtn}
            />
            {currentImage && (
              <Image
                source={currentImage}
                style={styles.zoomedImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Pressable>
      </Modal>

      <View style={styles.contentRow}>
        {/* Coluna Esquerda - Galeria de Imagens */}
        <View style={styles.imageColumn}>
          {/* Imagem Principal */}
          <TouchableOpacity
            onPress={() => setIsZoomed(true)}
            activeOpacity={0.9}
          >
            <Card style={styles.imageCard}>
              {currentImage ? (
                <Image source={currentImage} style={styles.mainImage} />
              ) : (
                <View style={[styles.mainImage, { backgroundColor: "#E5E5EA" }]} />
              )}
            </Card>
          </TouchableOpacity>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <FlatList
              data={galleryImages}
              renderItem={({ item, index }) => (
                <Card
                  style={[
                    styles.thumbnailCard,
                    selectedImageIndex === index && styles.thumbnailCardActive,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={item}
                    style={styles.thumbnail}
                  />
                </Card>
              )}
              keyExtractor={(_, index) => `thumb-${index}`}
              scrollEnabled={false}
              numColumns={4}
              columnWrapperStyle={styles.thumbnailRow}
            />
          )}
        </View>

        {/* Coluna Direita - Info Produto */}
        <View style={styles.rightColumn}>
          {/* Título do Produto */}
          <Text variant="headlineSmall" style={styles.productTitle}>
            {product.name}
          </Text>

          {/* Rating e Reviews */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(product.rating)}
              </View>
              <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
            </View>
          )}

          {/* Preço e Stock */}
          <View style={styles.priceStockRow}>
            <Text style={styles.price}>€ {product.price.toFixed(2)}</Text>
            <Text
              style={[
                styles.stock,
                {
                  color:
                    product.quantityAvailable > 0 ? "#34C759" : "#FF3B30",
                },
              ]}
            >
              {product.quantityAvailable > 0
                ? `Only ${product.quantityAvailable} in stock`
                : "Out of stock"}
            </Text>
          </View>

          {/* Descrição */}
          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {/* Features/Características */}
          {product.features && product.features.length > 0 && (
            <View style={styles.featuresContainer}>
              {product.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  style={styles.featureChip}
                  textStyle={styles.featureChipText}
                />
              ))}
            </View>
          )}

          {/* Quantidade + Adicionar ao Carrinho + Wishlist */}
          {product.quantityAvailable > 0 && (
            <>
              {/* Card Quantidade */}
              <Card style={styles.quantityCard}>
                <Card.Content style={styles.quantityContent}>
                  <Text style={styles.quantityLabel}>Qty:</Text>
                  <View style={styles.quantityButtons}>
                    <Button
                      mode="outlined"
                      onPress={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                      style={styles.quantityBtn}
                      labelStyle={styles.quantityBtnLabel}
                    >
                      −
                    </Button>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <Button
                      mode="outlined"
                      onPress={handleIncreaseQuantity}
                      disabled={quantity >= product.quantityAvailable}
                      style={styles.quantityBtn}
                      labelStyle={styles.quantityBtnLabel}
                    >
                      +
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              {/* Carrinho + Wishlist */}
              <View style={styles.actionRow}>
                {/* Botão Adicionar ao Carrinho */}
                <Button
                  mode="contained"
                  onPress={handleAddToCart}
                  disabled={isAdding}
                  style={styles.addToCartBtn}
                  labelStyle={styles.addToCartBtnLabel}
                >
                  {isAdding ? "Adding..." : "Add to cart"}
                </Button>

                {/* Wishlist */}
                <IconButton
                  icon={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  iconColor={isFavorite ? "#FF3B30" : "#999"}
                  onPress={() => setIsFavorite(!isFavorite)}
                  style={styles.wishlistBtn}
                />
              </View>

              {/* Shipping Info */}
              {product.shipping && (
                <View style={styles.shippingContainer}>
                  <MaterialIcons name="local-shipping" size={16} color="#666" />
                  <Text style={styles.shippingText}>
                    {product.shipping.shippingType || "Standard shipping"} • {product.shipping.estimatedDays || "3-5 days"}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Products</Text>
          <FlatList
            data={relatedProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.push("PDP", { id: item.id })}
                style={styles.relatedProductCard}
              >
                <Card style={styles.relatedCard}>
                  <Image
                    source={item.image}
                    style={styles.relatedImage}
                  />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.relatedPrice}>€ {item.price.toFixed(2)}</Text>
                    {item.rating && (
                      <View style={styles.relatedRating}>
                        <MaterialIcons name="star" size={12} color="#FFB800" />
                        <Text style={styles.relatedRatingText}>{item.rating}</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.relatedList}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  
  // Imagens - Left Column
  imageColumn: { width: "45%", gap: 12 },
  imageCard: { borderRadius: 12, overflow: "hidden", cursor: "zoom-in" },
  mainImage: { width: "100%", height: 350, backgroundColor: "#fff" },
  thumbnailRow: { gap: 8 },
  thumbnailCard: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailCardActive: { borderColor: "#007AFF" },
  thumbnail: { width: "100%", height: 70 },

  // Info direita - Right Column
  rightColumn: { flex: 1, gap: 14 },
  
  // Product Title
  productTitle: { fontWeight: "bold", fontSize: 22, lineHeight: 28 },
  
  // Rating
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  starsContainer: { flexDirection: "row", alignItems: "center" },
  reviewCount: { fontSize: 13, opacity: 0.6 },

  // Price and Stock
  priceStockRow: { gap: 6 },
  price: { fontSize: 20, fontWeight: "bold", color: "#007AFF" },
  stock: { fontSize: 12, fontWeight: "600" },

  // Description
  description: { fontSize: 13, opacity: 0.75, lineHeight: 18 },

  // Features
  featuresContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  featureChip: { backgroundColor: "#F0F0F0", height: 28 },
  featureChipText: { fontSize: 11 },

  // Action Row
  actionRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  quantityCard: { borderRadius: 8, width: "100%" },
  quantityContent: { gap: 6, paddingVertical: 6, paddingHorizontal: 8 },
  quantityLabel: { fontSize: 11, fontWeight: "600" },
  quantityButtons: { flexDirection: "row", alignItems: "center", gap: 4 },
  quantityBtn: { flex: 1, borderRadius: 6, minHeight: 32 },
  quantityBtnLabel: { fontSize: 12 },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
  },

  // Add to Cart Button
  addToCartBtn: { flex: 1, borderRadius: 8 },
  addToCartBtnLabel: { fontSize: 12, fontWeight: "bold" },

  // Wishlist Button
  wishlistBtn: { margin: 0, padding: 8 },

  // Shipping
  shippingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  shippingText: { fontSize: 12, color: "#666", flex: 1 },

  // Related Products
  relatedSection: { marginTop: 32, marginBottom: 16 },
  relatedTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  relatedList: { paddingHorizontal: 4 },
  relatedProductCard: { marginRight: 16 },
  relatedCard: { 
    width: 180, 
    borderRadius: 12, 
    overflow: "hidden",
  },
  relatedImage: { width: "100%", height: 180, backgroundColor: "#fff" },
  relatedInfo: { padding: 12, gap: 4 },
  relatedName: { fontSize: 14, fontWeight: "600", lineHeight: 18 },
  relatedPrice: { fontSize: 16, fontWeight: "bold", color: "#007AFF" },
  relatedRating: { flexDirection: "row", alignItems: "center", gap: 4 },
  relatedRatingText: { fontSize: 12, color: "#666" },

  // Zoom Modal
  zoomModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomContainer: {
    width: "90%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
  },
  closeZoomBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
