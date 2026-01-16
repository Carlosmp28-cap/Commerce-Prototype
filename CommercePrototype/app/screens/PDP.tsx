import React, { useMemo, useState, useRef } from "react";
import { StyleSheet, View, Image, ScrollView, FlatList, TouchableOpacity, Modal, Pressable, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text, Chip, IconButton, Menu } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import type { Product } from "../models/Product";
import { getProductById, products, categories } from "../data/catalog";
import { useCart } from "../hooks/useCart";

type Props = NativeStackScreenProps<RootStackParamList, "PDP">;

export default function PDPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { addItem } = useCart();
  const { id } = route.params;
  const { width } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantityMenuVisible, setQuantityMenuVisible] = useState(false);
  const quantityAnchorRef = useRef(null);

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

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : [];

  const currentImage = galleryImages[selectedImageIndex];

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
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

      {/* Breadcrumbs */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.breadcrumbCurrent}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}> › </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("PLP", { 
            q: categories.find(c => c.id === product.categoryId)?.query 
          })}
        >
          <Text style={styles.breadcrumbCurrent}>
            {categories.find(c => c.id === product.categoryId)?.label || "Products"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.breadcrumbSeparator}> › </Text>
        <Text style={styles.breadcrumbCurrent}>{product.name}</Text>
      </View>

      {isDesktop ? (
        /* Layout Desktop - 3 Colunas */
        <View style={styles.contentRow}>
          {/* Coluna Esquerda - Thumbnails Verticais */}
          <View style={styles.thumbnailsColumn}>
            {galleryImages.map((item, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                onPress={() => setSelectedImageIndex(index)}
                activeOpacity={0.7}
              >
                <Card
                  style={[
                    styles.thumbnailCard,
                    selectedImageIndex === index && styles.thumbnailCardActive,
                  ]}
                >
                  <Image
                    source={item}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Coluna Central - Imagem Principal */}
          <View style={styles.imageColumn}>
            <TouchableOpacity
              onPress={() => setIsZoomed(true)}
              activeOpacity={0.9}
            >
              <Card style={styles.imageCard}>
                {currentImage ? (
                  <Image source={currentImage} style={styles.mainImageDesktop} resizeMode="cover" />
                ) : (
                  <View style={[styles.mainImageDesktop, { backgroundColor: "#E5E5EA" }]} />
                )}
              </Card>
            </TouchableOpacity>
          </View>

          {/* Coluna Direita - Info Produto */}
          <View style={styles.rightColumn}>
            {/* Título + Wishlist */}
            <View style={styles.titleRow}>
              <Text variant="headlineSmall" style={styles.productTitleDesktop}>
                {product.name}
              </Text>
              <IconButton
                icon={isFavorite ? "heart" : "heart-outline"}
                size={24}
                onPress={() => setIsFavorite(!isFavorite)}
                style={styles.favoriteIcon}
                iconColor={isFavorite ? "#000000" : "#1a1a1a"}
              />
            </View>

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
              <Text style={styles.priceDesktop}>€ {product.price.toFixed(2)}</Text>
              <Text
                style={[
                  styles.stock,
                  {
                    color:
                      product.quantityAvailable > 0 ? "#34C759" : "#FF3B30",
                  },
                ]}
              >
                {product.quantityAvailable > 0 ? "In stock" : "Out of stock"}
              </Text>
            </View>

            {/* Descrição */}
            {product.description && (
              <Text style={styles.description}>{product.description}</Text>
            )}

            {/* Informações Extra */}
            <View style={styles.extraInfoCard}>
              <Text style={styles.extraInfoTitle}>Detalhes que importam</Text>
              <Text style={styles.extraInfoText}>
                Construído para conforto diário com materiais macios e respiráveis, inspirado no look esportivo premium da Nike.
              </Text>
              <Text style={styles.extraInfoText}>
                Ajuste: fiel ao tamanho • Amortecimento: responsivo • Uso: cotidiano e treinos leves.
              </Text>
            </View>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <View style={styles.featuresContainer}>
                {product.features.map((feature, index) => (
                  <Chip
                    key={index}
                    style={styles.featureChip}
                    textStyle={styles.featureChipText}
                  >
                    {feature}
                  </Chip>
                ))}
              </View>
            )}

            {/* Quantidade + Adicionar ao Carrinho */}
            {product.quantityAvailable > 0 && (
              <>
                <View style={styles.quantityActionRow}>
                  <View style={styles.quantitySelectorWrapper}>
                    <Text style={styles.quantityPickerLabel}>Quantity</Text>
                    <Menu
                      visible={quantityMenuVisible}
                      onDismiss={() => setQuantityMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          ref={quantityAnchorRef}
                          style={styles.quantitySelector}
                          onPress={() => setQuantityMenuVisible(true)}
                        >
                          <Text style={styles.quantitySelectorText}>{quantity}</Text>
                          <MaterialIcons name="expand-more" size={20} color="#007AFF" />
                        </TouchableOpacity>
                      }
                    >
                      {Array.from({ length: Math.min(product.quantityAvailable, 10) }, (_, i) => i + 1).map((num) => (
                        <Menu.Item
                          key={num}
                          onPress={() => {
                            setQuantity(num);
                            setQuantityMenuVisible(false);
                          }}
                          title={`${num}`}
                        />
                      ))}
                    </Menu>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    disabled={isAdding}
                    style={styles.addToCartButton}
                    labelStyle={styles.addToCartLabel}
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </Button>
                </View>

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
      ) : (
        /* Layout Mobile - Vertical */
        <>
          {/* Título + Wishlist */}
          <View style={styles.titleRow}>
            <Text variant="headlineSmall" style={styles.productTitleMobile}>
              {product.name}
            </Text>
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              size={24}
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.favoriteIcon}
              iconColor={isFavorite ? "#FF3B30" : "#1a1a1a"}
            />
          </View>

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
            <Text style={styles.priceMobile}>€ {product.price.toFixed(2)}</Text>
            <Text
              style={[
                styles.stock,
                {
                  color:
                    product.quantityAvailable > 0 ? "#34C759" : "#FF3B30",
                },
              ]}
            >
              {product.quantityAvailable > 0 ? "In stock" : "Out of stock"}
            </Text>
          </View>

          {/* Descrição curta */}
          {product.description && (
            <Text style={styles.descriptionMobileTop}>{product.description}</Text>
          )}

          {/* Imagem Principal */}
          <TouchableOpacity
            onPress={() => setIsZoomed(true)}
            activeOpacity={0.9}
          >
            <Card style={styles.imageCard}>
              {currentImage ? (
                <Image source={currentImage} style={styles.mainImageMobile} resizeMode="cover" />
              ) : (
                <View style={[styles.mainImageMobile, { backgroundColor: "#E5E5EA" }]} />
              )}
            </Card>
          </TouchableOpacity>

          {/* Galeria de Thumbnails - Por baixo da imagem principal */}
          {galleryImages.length > 1 && (
            <View style={styles.thumbnailsRowContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailsContent}
              >
                {galleryImages.map((item, index) => (
                  <TouchableOpacity
                    key={`thumb-${index}`}
                    onPress={() => setSelectedImageIndex(index)}
                    activeOpacity={0.7}
                  >
                    <Card
                      style={[
                        styles.thumbnailCardMobile,
                        selectedImageIndex === index && styles.thumbnailCardActive,
                      ]}
                    >
                      <Image
                        source={item}
                        style={styles.thumbnailMobile}
                        resizeMode="cover"
                      />
                    </Card>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Info do Produto */}
          <View style={styles.productInfo}>
            {/* Informações Extra */}
            <View style={styles.extraInfoCard}>
              <Text style={styles.extraInfoTitle}>Detalhes que importam</Text>
              <Text style={styles.extraInfoText}>
                Construído para conforto diário com materiais macios e respiráveis, inspirado no look esportivo premium da Nike.
              </Text>
              <Text style={styles.extraInfoText}>
                Ajuste: fiel ao tamanho • Amortecimento: responsivo • Uso: cotidiano e treinos leves.
              </Text>
            </View>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <View style={styles.featuresContainer}>
                {product.features.map((feature, index) => (
                  <Chip
                    key={index}
                    style={styles.featureChip}
                    textStyle={styles.featureChipText}
                  >
                    {feature}
                  </Chip>
                ))}
              </View>
            )}

            {/* Quantidade + Adicionar ao Carrinho */}
            {product.quantityAvailable > 0 && (
              <>
                <View style={styles.quantityActionRow}>
                  <View style={styles.quantitySelectorWrapper}>
                    <Text style={styles.quantityPickerLabel}>Quantity</Text>
                    <Menu
                      visible={quantityMenuVisible}
                      onDismiss={() => setQuantityMenuVisible(false)}
                      anchor={
                        <TouchableOpacity
                          ref={quantityAnchorRef}
                          style={styles.quantitySelector}
                          onPress={() => setQuantityMenuVisible(true)}
                        >
                          <Text style={styles.quantitySelectorText}>{quantity}</Text>
                          <MaterialIcons name="expand-more" size={20} color="#007AFF" />
                        </TouchableOpacity>
                      }
                    >
                      {Array.from({ length: Math.min(product.quantityAvailable, 10) }, (_, i) => i + 1).map((num) => (
                        <Menu.Item
                          key={num}
                          onPress={() => {
                            setQuantity(num);
                            setQuantityMenuVisible(false);
                          }}
                          title={`${num}`}
                        />
                      ))}
                    </Menu>
                  </View>

                  <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    disabled={isAdding}
                    style={styles.addToCartButton}
                    labelStyle={styles.addToCartLabel}
                  >
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </Button>
                </View>

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
        </>
      )}

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
  container: { 
    flex: 1, 
    padding: 16,
  },
  scrollContent: { 
    paddingBottom: 32,
  },
  
  // Breadcrumbs
  breadcrumbContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingVertical: 8,
  },
  breadcrumbSeparator: {
    fontSize: 14,
    color: "#CCC",
    marginHorizontal: 4,
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: "#4e4e4e",
    fontWeight: "500",
  },

  // Desktop Layout
  contentRow: { 
    flexDirection: "row", 
    gap: 50, 
    marginBottom: 64,
  },
  thumbnailsColumn: { 
    width: 50, 
    gap: 12, 
    flexDirection: "column",
  },
  imageColumn: { 
    flex: 0.65, 
    gap: 16,
  },
  rightColumn: { 
    flex: 1, 
    gap: 0,
  },

  // Mobile Layout - Thumbnails Horizontal
  thumbnailsRowContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 0,
  },
  thumbnailsContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  
  // Thumbnails (ambos)
  thumbnailCard: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    marginRight: 8,
  },
  thumbnailCardMobile: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  thumbnailCardActive: { 
    borderColor: "#007AFF",
  },
  thumbnail: { 
    width: 70, 
    height: 70,
  },
  thumbnailMobile: { 
    width: 50, 
    height: 50,
  },
  
  // Imagem Principal
  imageCard: { 
    borderRadius: 12, 
    overflow: "hidden",
    marginBottom: 8,
    elevation: 2, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 2 },
  },
  mainImageMobile: { 
    width: "100%", 
    height: 300,
    backgroundColor: "#f5f5f5",
  },
  mainImageDesktop: { 
    width: "100%", 
    height: 600,
    backgroundColor: "#f5f5f5",
  },

  // Info do Produto
  productInfo: {
    paddingHorizontal: 4,
  },
  
  titleRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    justifyContent: "space-between", 
    marginBottom: 8,
  },
  productTitleMobile: { 
    fontWeight: "700", 
    fontSize: 24, 
    lineHeight: 32,
    flex: 1,
    color: "#0f172a",
  },
  productTitleDesktop: { 
    fontWeight: "800", 
    fontSize: 38, 
    lineHeight: 46,
    marginBottom: 5,
    flex: 1,
    color: "#0f172a",
  },
  favoriteIcon: { 
    margin: 0,
  },
  
  // Rating
  ratingContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4, 
    marginBottom: 22,
  },
  starsContainer: { 
    flexDirection: "row", 
    alignItems: "center",
  },
  reviewCount: { 
    fontSize: 13, 
    color: "#666",
    fontWeight: "600",
  },

  // Price and Stock
  priceStockRow: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 12, 
    marginBottom: 16,
  },
  priceMobile: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#0f172a",
  },
  priceDesktop: { 
    fontSize: 38, 
    fontWeight: "800", 
    color: "#0f172a",
  },
  stock: { 
    fontSize: 13, 
    fontWeight: "700", 
    paddingVertical: 4, 
    paddingHorizontal: 12, 
    borderRadius: 6,
    backgroundColor: "#F2F7F3",
  },

  // Description
  description: { 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 16,
    color: "#4b5563",
  },
  descriptionMobileTop: { 
    fontSize: 14, 
    lineHeight: 20, 
    marginBottom: 16,
    marginTop: 4,
    color: "#4b5563",
  },

  // Extra Info
  extraInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginBottom: 16,
  },
  extraInfoTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#0f172a",
    marginBottom: 8,
  },
  extraInfoText: { 
    fontSize: 14, 
    lineHeight: 20, 
    color: "#374151",
    marginBottom: 6,
  },

  // Features
  featuresContainer: { 
    flexDirection: "row", 
    gap: 8, 
    flexWrap: "wrap", 
    marginBottom: 20,
  },
  featureChip: { 
    backgroundColor: "#FFFFFF", 
    height: 36, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  featureChipText: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#0f172a",
  },

  // Quantity + Action
  quantityActionRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 12,
    alignItems: "flex-end",
  },
  quantitySelectorWrapper: {
    flex: 1,
  },
  quantityPickerLabel: { 
    fontSize: 12, 
    fontWeight: "700", 
    marginBottom: 6,
    color: "#4b5563",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quantitySelectorText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
  },

  // Add to Cart Button
  addToCartButton: {
    flex: 2,
    borderRadius: 10,
    backgroundColor: "#000000",
    paddingVertical: 6,
  },
  addToCartLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Shipping
  shippingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#000000",
    marginBottom: 20,
  },
  shippingText: { 
    fontSize: 14, 
    color: "#2d3748",
    flex: 1,
    fontWeight: "600",
  },

  // Related Products
  relatedSection: { 
    marginTop: 32,
    marginBottom: 20,
  },
  relatedTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 16,
    color: "#000000",
  },
  relatedList: { 
    paddingRight: 16,
  },
  relatedProductCard: { 
    marginRight: 12,
  },
  relatedCard: { 
    width: 200, 
    borderRadius: 12, 
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  relatedImage: { 
    width: "100%", 
    height: 200,
    backgroundColor: "#f5f5f5",
  },
  relatedInfo: { 
    padding: 12,
  },
  relatedName: { 
    fontSize: 13, 
    fontWeight: "600",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  relatedPrice: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: "#000000",
    marginBottom: 4,
  },
  relatedRating: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4,
  },
  relatedRatingText: { 
    fontSize: 12, 
    color: "#999",
  },

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
