import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import type { RootStackParamList } from "../../navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  categories,
  getFeaturedProducts,
  products,
  type CatalogProduct,
} from "../../data/catalog";

import { HOME_STRINGS } from "./homeStrings";
import { applyWebHead } from "./webHead";
import { createPicsumResizer } from "./picsum";
import { normalizeHomeSearchQuery } from "./searchUtils";
import type { HomeFeaturedProduct } from "./components/HomeFeaturedCarousel";

/** Data + actions needed by the Home screen. */
export type HomeViewModel = {
  // Layout flags
  homeMaxWidth: number;
  isWideWeb: boolean;

  // Search
  query: string;
  setQuery: (q: string) => void;
  submitSearch: () => void;

  // Images / tiles
  heroImage: CatalogProduct["image"] | undefined;
  categoryTiles: Array<{
    id: string;
    label: string;
    query: string;
    image: CatalogProduct["image"] | undefined;
  }>;
  featuredProducts: HomeFeaturedProduct[];

  // Navigation actions
  goToPLP: () => void;
  goToSale: () => void;
  goToNew: () => void;
  selectCategory: (categoryQuery: string) => void;
  openProduct: (id: string) => void;

  // Data
  categories: typeof categories;
};

type Navigation = NativeStackNavigationProp<RootStackParamList, "Home">;

/**
 * Home view-model hook.
 * @param navigation - Typed navigation object for the Home route
 * @param width - Current window width used for responsive layout decisions
 * @returns Derived Home data and stable UI actions
 */
export function useHomeViewModel(
  navigation: Navigation,
  width: number
): HomeViewModel {
  // Keep a single resizer instance per mount so its in-memory cache stays effective.
  const resizePicsumSource = useMemo(() => createPicsumResizer(), []);

  useEffect(() => {
    // Web-only: set document title/metadata for SEO/Lighthouse.
    const href =
      typeof window !== "undefined" && window.location
        ? window.location.href
        : undefined;

    applyWebHead({
      title: HOME_STRINGS.documentTitle,
      description: HOME_STRINGS.metaDescription,
      canonicalHref: href,
    });
  }, []);

  const homeMaxWidth = useMemo(() => {
    if (Platform.OS !== "web") return 980;
    if (width >= 1600) return 1400;
    if (width >= 1280) return 1200;
    return 980;
  }, [width]);

  const isWideWeb = Platform.OS === "web" && width >= 1024;

  const heroSize = useMemo(() => {
    // Hero is a likely LCP element on web; prefer smaller sources.
    if (width >= 1024) return { w: 960, h: 480 };
    if (width >= 420) return { w: 800, h: 400 };
    return { w: 640, h: 320 };
  }, [width]);

  const tileSize = useMemo(() => ({ w: 480, h: 320 }), []);
  const carouselSize = useMemo(() => ({ w: 480, h: 320 }), []);

  const [query, setQuery] = useState("");

  const heroImage = useMemo(() => {
    return resizePicsumSource(products[0]?.image, heroSize.w, heroSize.h);
  }, [heroSize.h, heroSize.w, resizePicsumSource]);

  const featuredProducts = useMemo((): HomeFeaturedProduct[] => {
    return getFeaturedProducts().map((p) => ({
      ...p,
      image: resizePicsumSource(p.image, carouselSize.w, carouselSize.h),
    }));
  }, [carouselSize.h, carouselSize.w, resizePicsumSource]);

  const representativeByCategory = useMemo(() => {
    const map = new Map<string, CatalogProduct>();
    for (const product of products) {
      if (!product?.categoryId) continue;
      if (!map.has(product.categoryId)) {
        map.set(product.categoryId, product);
      }
    }
    return map;
  }, []);

  const categoryTiles = useMemo(() => {
    return categories.map((c) => {
      const representative = representativeByCategory.get(c.id);
      return {
        ...c,
        image: resizePicsumSource(
          representative?.image,
          tileSize.w,
          tileSize.h
        ),
      };
    });
  }, [representativeByCategory, resizePicsumSource, tileSize.h, tileSize.w]);

  const submitSearch = useCallback(() => {
    const normalized = normalizeHomeSearchQuery(query);
    if (!normalized) {
      navigation.navigate("PLP");
      return;
    }
    navigation.navigate("PLP", { q: normalized });
  }, [navigation, query]);

  const goToPLP = useCallback(() => navigation.navigate("PLP"), [navigation]);
  const goToSale = useCallback(
    () => navigation.navigate("PLP", { q: "sale" }),
    [navigation]
  );
  const goToNew = useCallback(
    () => navigation.navigate("PLP", { q: "new" }),
    [navigation]
  );
  const selectCategory = useCallback(
    (categoryQuery: string) => navigation.navigate("PLP", { q: categoryQuery }),
    [navigation]
  );
  const openProduct = useCallback(
    (id: string) => navigation.navigate("PDP", { id }),
    [navigation]
  );

  return {
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

    categories,
  };
}
