import { memo } from "react";
import type { ImageSourcePropType } from "react-native";
import { Platform, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";

import { HomeImage } from "./HomeImage";
import { styles } from "./HomeCategoryGrid.styles";

function HomeCategoryGridComponent({
  title,
  categories,
  onSelectCategory,
}: {
  title: string;
  categories: Array<{
    id: string;
    label: string;
    query: string;
    image?: ImageSourcePropType;
  }>;
  onSelectCategory: (categoryQuery: string) => void;
}) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.categoryGrid}>
        {categories.map((c) => (
          <Card
            key={c.id}
            style={[
              styles.categoryTile,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            onPress={() => onSelectCategory(c.query)}
            accessibilityLabel={`Shop category ${c.label}`}
          >
            {c.image ? (
              Platform.OS === "web" ? (
                <HomeImage
                  source={c.image}
                  alt={`${c.label} category`}
                  style={styles.categoryTileImage}
                />
              ) : (
                <Card.Cover source={c.image} style={styles.categoryTileImage} />
              )
            ) : null}
            <Card.Content style={styles.categoryTileContent}>
              <Text variant="titleMedium" style={styles.categoryTileLabel}>
                {c.label}
              </Text>
              <Text style={styles.categoryTileSubtitle}>Explore</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
}

export const HomeCategoryGrid = memo(HomeCategoryGridComponent);
