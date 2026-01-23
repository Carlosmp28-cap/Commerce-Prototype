import { memo } from "react";
import type { ImageSourcePropType } from "react-native";
import { FlatList, Platform, View } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { HomeImage } from "../shared/HomeImage";

import { getAvailabilityLabel } from "../../../../utils/stock";
import { styles } from "./HomeFeaturedCarousel.styles";

/**
 * Product carousel used on Home.
 *
 * Uses `FlatList` for efficient horizontal virtualization and `HomeImage` on web
 * to render real `<img>` tags with alt text.
 */
export type HomeFeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
  quantityAvailable: number;
};

function HomeFeaturedCarouselComponent({
  title,
  products,
  onSeeAll,
  onOpenProduct,
}: {
  title: string;
  products: HomeFeaturedProduct[];
  onSeeAll: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Button
          mode="text"
          compact
          onPress={onSeeAll}
          accessibilityLabel="See all products"
        >
          See all
        </Button>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.carousel}
        renderItem={({ item }) => (
          <Card
            onPress={() => onOpenProduct(item.id)}
            style={[
              styles.productCard,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            accessibilityLabel={`Open product ${item.name}`}
          >
            {Platform.OS === "web" ? (
              <HomeImage
                source={item.image}
                alt={item.name}
                style={styles.productImage}
              />
            ) : (
              <Card.Cover source={item.image} style={styles.productImage} />
            )}
            <Card.Content style={styles.productContent}>
              <Text
                variant="titleMedium"
                style={styles.productTitle}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.productPrice,
                  { color: paperTheme.colors.primary },
                ]}
              >
                € {item.price.toFixed(2)}
              </Text>
              <Text style={styles.productMeta}>
                {getAvailabilityLabel(item.quantityAvailable)}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

export const HomeFeaturedCarousel = memo(HomeFeaturedCarouselComponent);
