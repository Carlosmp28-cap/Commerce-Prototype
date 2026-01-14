import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
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
      <CenteredContent maxWidth={980} contentStyle={styles.content}>
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
      </CenteredContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  content: { gap: 14 },
});
