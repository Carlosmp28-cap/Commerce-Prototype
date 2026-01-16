import React, { useMemo } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme as usePaperTheme } from "react-native-paper";

import { useTheme } from "../themes";
import type { RootStackParamList } from "../navigation";
import { categories, getFeaturedProducts, products } from "../data/catalog";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";

import { HomeHero } from "./home/components/HomeHero";
import { HomeSearch } from "./home/components/HomeSearch";
import { HomePromos } from "./home/components/HomePromos";
import { HomeCategoryGrid } from "./home/components/HomeCategoryGrid";
import {
  HomeFeaturedCarousel,
  type HomeFeaturedProduct,
} from "./home/components/HomeFeaturedCarousel";
import { HomeValueProps } from "./home/components/HomeValueProps";

// Home (landing) screen.
// Uses `ScreenScroll` so content gets footer-aware bottom padding automatically.

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  usePaperTheme();

  const { width } = useWindowDimensions();

  // Keep the mobile layout identical, but let the Home page breathe more on web/desktop.
  // This reduces the “empty left/right gutters” feeling on wide screens.
  const homeMaxWidth = useMemo(() => {
    if (Platform.OS !== "web") return 980;
    if (width >= 1600) return 1400;
    if (width >= 1280) return 1200;
    return 980;
  }, [width]);

  const isWideWeb = Platform.OS === "web" && width >= 1024;

  const [query, setQuery] = React.useState("");

  const featuredProducts = useMemo((): HomeFeaturedProduct[] => {
    return getFeaturedProducts();
  }, []);

  const categoryTiles = useMemo(() => {
    // SFRA-style “Shop by Category” tiles: pick a representative image per category.
    return categories.map((c) => {
      const representative = products.find((p) => p.categoryId === c.id);
      return { ...c, image: representative?.image };
    });
  }, []);

  return (
    <ScreenScroll contentContainerStyle={styles.screenContent}>
      <CenteredContent maxWidth={homeMaxWidth} contentStyle={styles.content}>
        {isWideWeb ? (
          <>
            <View style={styles.desktopTopRow}>
              <View style={styles.desktopLeftCol}>
                <HomeHero
                  heroImage={products[0]?.image}
                  onShopAll={() => navigation.navigate("PLP")}
                  onShopSale={() => navigation.navigate("PLP", { q: "sale" })}
                />

                <HomeSearch
                  query={query}
                  onChangeQuery={setQuery}
                  onSubmit={() =>
                    navigation.navigate("PLP", { q: query.trim() })
                  }
                  categories={categories}
                  onSelectCategory={(q) => navigation.navigate("PLP", { q })}
                />
              </View>

              <View style={styles.desktopRightCol}>
                <HomePromos
                  layout="column"
                  onShopNew={() => navigation.navigate("PLP", { q: "new" })}
                  onShopSale={() => navigation.navigate("PLP", { q: "sale" })}
                />
              </View>
            </View>

            <HomeCategoryGrid
              title="Shop by Category"
              categories={categoryTiles}
              onSelectCategory={(q) => navigation.navigate("PLP", { q })}
            />

            <HomeFeaturedCarousel
              title="Featured"
              products={featuredProducts}
              onSeeAll={() => navigation.navigate("PLP")}
              onOpenProduct={(id) => navigation.navigate("PDP", { id })}
            />

            <HomeValueProps title="Why shop with us" />
          </>
        ) : (
          <>
            <HomeHero
              heroImage={products[0]?.image}
              onShopAll={() => navigation.navigate("PLP")}
              onShopSale={() => navigation.navigate("PLP", { q: "sale" })}
            />

            <HomeSearch
              query={query}
              onChangeQuery={setQuery}
              onSubmit={() => navigation.navigate("PLP", { q: query.trim() })}
              categories={categories}
              onSelectCategory={(q) => navigation.navigate("PLP", { q })}
            />

            <HomePromos
              onShopNew={() => navigation.navigate("PLP", { q: "new" })}
              onShopSale={() => navigation.navigate("PLP", { q: "sale" })}
            />

            <HomeCategoryGrid
              title="Shop by Category"
              categories={categoryTiles}
              onSelectCategory={(q) => navigation.navigate("PLP", { q })}
            />

            <HomeFeaturedCarousel
              title="Featured"
              products={featuredProducts}
              onSeeAll={() => navigation.navigate("PLP")}
              onOpenProduct={(id) => navigation.navigate("PDP", { id })}
            />

            <HomeValueProps title="Why shop with us" />
          </>
        )}
      </CenteredContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  content: { gap: 14 },
  desktopTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  desktopLeftCol: {
    flex: 2,
    minWidth: 0,
    gap: 14,
  },
  desktopRightCol: {
    flex: 1,
    minWidth: 0,
  },
});
