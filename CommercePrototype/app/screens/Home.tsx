import React, { useMemo } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

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

type AnyImageSource = any;

function resizePicsumSource(
  source: AnyImageSource | undefined,
  width: number,
  height: number
): AnyImageSource | undefined {
  if (!source) return source;
  if (typeof source !== "object" || Array.isArray(source)) return source;

  const uri = typeof source.uri === "string" ? source.uri : undefined;
  if (!uri) return source;
  if (!uri.includes("picsum.photos/seed/")) return source;

  // Example: https://picsum.photos/seed/sku-new-001/800/800
  // Replace the trailing /{w}/{h} while preserving any query string.
  const updatedUri = uri.replace(
    /\/(\d+)\/(\d+)(\?.*)?$/,
    `/${width}/${height}$3`
  );
  if (updatedUri === uri) return source;
  return { ...source, uri: updatedUri };
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = "Home — CommercePrototype";

    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      "Browse featured products, shop by category, and discover new season essentials."
    );

    const ensureMetaProperty = (name: string, content: string) => {
      let tag = document.querySelector(`meta[property='${name}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMetaProperty("og:title", "Home — CommercePrototype");
    ensureMetaProperty(
      "og:description",
      "Browse featured products, shop by category, and discover new season essentials."
    );
    ensureMetaProperty("og:type", "website");

    // Canonical helps SEO audits on SPAs.
    const href =
      typeof window !== "undefined" ? window.location.href : undefined;
    if (href) {
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", href);
    }
  }, []);

  // Keep the mobile layout identical, but let the Home page breathe more on web/desktop.
  // This reduces the “empty left/right gutters” feeling on wide screens.
  const homeMaxWidth = useMemo(() => {
    if (Platform.OS !== "web") return 980;
    if (width >= 1600) return 1400;
    if (width >= 1280) return 1200;
    return 980;
  }, [width]);

  const isWideWeb = Platform.OS === "web" && width >= 1024;

  // Home uses remote placeholder images (picsum). Keep Home images much smaller than
  // the default catalog images to reduce network contention and improve LCP on web.
  const heroSize = useMemo(() => {
    if (width >= 1024) return { w: 960, h: 480 };
    if (width >= 420) return { w: 800, h: 400 };
    return { w: 640, h: 320 };
  }, [width]);

  const tileSize = useMemo(() => ({ w: 480, h: 320 }), []);
  const carouselSize = useMemo(() => ({ w: 480, h: 320 }), []);

  const [query, setQuery] = React.useState("");

  const heroImage = useMemo(() => {
    return resizePicsumSource(products[0]?.image, heroSize.w, heroSize.h);
  }, [heroSize.h, heroSize.w]);

  const featuredProducts = useMemo((): HomeFeaturedProduct[] => {
    return getFeaturedProducts().map((p) => ({
      ...p,
      image: resizePicsumSource(p.image, carouselSize.w, carouselSize.h),
    }));
  }, [carouselSize.h, carouselSize.w]);

  const categoryTiles = useMemo(() => {
    // SFRA-style “Shop by Category” tiles: pick a representative image per category.
    return categories.map((c) => {
      const representative = products.find((p) => p.categoryId === c.id);
      return {
        ...c,
        image: resizePicsumSource(
          representative?.image,
          tileSize.w,
          tileSize.h
        ),
      };
    });
  }, [tileSize.h, tileSize.w]);

  return (
    <ScreenScroll contentContainerStyle={styles.screenContent}>
      <CenteredContent maxWidth={homeMaxWidth} contentStyle={styles.content}>
        {isWideWeb ? (
          <>
            <View style={styles.desktopTopRow}>
              <View style={styles.desktopLeftCol}>
                <HomeHero
                  heroImage={heroImage}
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
              heroImage={heroImage}
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
