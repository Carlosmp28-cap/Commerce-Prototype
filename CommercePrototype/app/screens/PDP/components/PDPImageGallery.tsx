import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import { Card, IconButton } from "react-native-paper";
import { useTheme } from "../../../themes";

interface PDPImageGalleryProps {
  images: ImageSourcePropType[];
  isDesktop: boolean;
}

export default function PDPImageGallery({ images, isDesktop }: PDPImageGalleryProps) {
  const theme = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = images[selectedImageIndex];

  if (isDesktop) {
    return (
      <>
        <Modal
          visible={isZoomed}
          transparent
          animationType="fade"
          onRequestClose={() => setIsZoomed(false)}
        >
          <Pressable style={styles.zoomModal} onPress={() => setIsZoomed(false)}>
            <View style={styles.zoomContainer}>
              <IconButton
                icon="close"
                size={32}
                iconColor="#fff"
                onPress={() => setIsZoomed(false)}
                accessibilityLabel="Close image zoom"
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

        <View style={styles.thumbnailsColumn}>
          {images.map((item, index) => (
            <TouchableOpacity
              key={`thumb-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Select image ${index + 1}`}
              onPress={() => setSelectedImageIndex(index)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.thumbnailCard,
                  { borderColor: theme.colors.border },
                  selectedImageIndex === index && { borderColor: theme.colors.primary },
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

        <View style={styles.imageColumn}>
          <TouchableOpacity
            onPress={() => setIsZoomed(true)}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Open image zoom"
          >
            <Card style={styles.imageCard}>
              {currentImage ? (
                <Image
                  source={currentImage}
                  style={[styles.mainImageDesktop, { backgroundColor: theme.colors.background }]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.mainImageDesktop,
                    { backgroundColor: theme.colors.placeholder },
                  ]}
                />
              )}
            </Card>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // Mobile Layout
  return (
    <>
      <Modal
        visible={isZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setIsZoomed(false)}
      >
        <Pressable style={styles.zoomModal} onPress={() => setIsZoomed(false)}>
          <View style={styles.zoomContainer}>
            <IconButton
              icon="close"
              size={32}
              iconColor="#fff"
              onPress={() => setIsZoomed(false)}
              accessibilityLabel="Close image zoom"
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

      <TouchableOpacity
        onPress={() => setIsZoomed(true)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Open image zoom"
      >
        <Card style={styles.imageCard}>
          {currentImage ? (
            <Image
              source={currentImage}
              style={[styles.mainImageMobile, { backgroundColor: theme.colors.background }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.mainImageMobile,
                { backgroundColor: theme.colors.placeholder },
              ]}
            />
          )}
        </Card>
      </TouchableOpacity>

      {images.length > 1 && (
        <View style={styles.thumbnailsRowContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {images.map((item, index) => (
              <TouchableOpacity
                key={`thumb-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Select image ${index + 1}`}
                onPress={() => setSelectedImageIndex(index)}
                activeOpacity={0.7}
              >
                <Card
                  style={[
                    styles.thumbnailCardMobile,
                    { borderColor: theme.colors.border },
                    selectedImageIndex === index &&
                      { borderColor: theme.colors.primary },
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
    </>
  );
}

const styles = StyleSheet.create({
  // Desktop Layout
  thumbnailsColumn: {
    width: 50,
    gap: 12,
    flexDirection: "column",
  },
  imageColumn: {
    flex: 0.65,
    gap: 16,
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

  // Thumbnails (both)
  thumbnailCard: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#00000000",
    marginRight: 8,
  },
  thumbnailCardMobile: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#00000000",
  },
  thumbnailCardActive: {},
  thumbnail: {
    width: 70,
    height: 70,
  },
  thumbnailMobile: {
    width: 50,
    height: 50,
  },

  // Main Image
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
    aspectRatio: 1,
    backgroundColor: "#00000000",
  },
  mainImageDesktop: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#00000000",
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
