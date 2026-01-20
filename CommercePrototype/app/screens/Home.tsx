import { useMemo } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation";
import { categories } from "../data/catalog";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";

import { HomeHero } from "./home/components/HomeHero";
import { HomeSearch } from "./home/components/HomeSearch";
import { HomePromos } from "./home/components/HomePromos";
import { HomeCategoryGrid } from "./home/components/HomeCategoryGrid";
import { HomeFeaturedCarousel } from "./home/components/HomeFeaturedCarousel";
import { HomeValueProps } from "./home/components/HomeValueProps";

import { HOME_STRINGS } from "./home/homeStrings";
import { useHomeViewModel } from "./home/useHomeViewModel";

/** Home (landing) screen. */

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const {
    homeMaxWidth,
    isWideWeb,
    query,
    setQuery,
    submitSearch,
    heroImage,
    categoryTiles,
    featuredProducts,
    goToPLP,
    goToSale,
    goToNew,
    selectCategory,
    openProduct,
  } = useHomeViewModel(navigation, width);

  return (
    <ScreenScroll contentContainerStyle={styles.screenContent}>
      <CenteredContent maxWidth={homeMaxWidth} contentStyle={styles.content}>
        {isWideWeb ? (
          <>
            <View style={styles.desktopTopRow}>
              <View style={styles.desktopLeftCol}>
                <HomeHero
                  heroImage={heroImage}
                  onShopAll={goToPLP}
                  onShopSale={goToSale}
                />

                <HomeSearch
                  query={query}
                  onChangeQuery={setQuery}
                  onSubmit={submitSearch}
                  categories={categories}
                  onSelectCategory={selectCategory}
                />
              </View>

              <View style={styles.desktopRightCol}>
                <HomePromos
                  layout="column"
                  onShopNew={goToNew}
                  onShopSale={goToSale}
                />
              </View>
            </View>

            <HomeCategoryGrid
              title={HOME_STRINGS.shopByCategoryTitle}
              categories={categoryTiles}
              onSelectCategory={selectCategory}
            />

            <HomeFeaturedCarousel
              title={HOME_STRINGS.featuredTitle}
              products={featuredProducts}
              onSeeAll={goToPLP}
              onOpenProduct={openProduct}
            />

            <HomeValueProps title={HOME_STRINGS.valuePropsTitle} />
          </>
        ) : (
          <>
            <HomeHero
              heroImage={heroImage}
              onShopAll={goToPLP}
              onShopSale={goToSale}
            />

            <HomeSearch
              query={query}
              onChangeQuery={setQuery}
              onSubmit={submitSearch}
              categories={categories}
              onSelectCategory={selectCategory}
            />

            <HomePromos onShopNew={goToNew} onShopSale={goToSale} />

            <HomeCategoryGrid
              title={HOME_STRINGS.shopByCategoryTitle}
              categories={categoryTiles}
              onSelectCategory={selectCategory}
            />

            <HomeFeaturedCarousel
              title={HOME_STRINGS.featuredTitle}
              products={featuredProducts}
              onSeeAll={goToPLP}
              onOpenProduct={openProduct}
            />

            <HomeValueProps title={HOME_STRINGS.valuePropsTitle} />
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
