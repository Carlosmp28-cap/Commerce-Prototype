import { useCallback, useEffect, useMemo } from "react";
import { Platform } from "react-native";

import type { RootStackParamList } from "../../navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { categories, products, type CatalogProduct } from "../../data/catalog";
import type { CategoryNodeDto } from "../../models";
import { useCategories, getMainCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../models/Product";

import { HOME_STRINGS } from "./homeStrings";
import { applyWebHead } from "./webHead";
import { createPicsumResizer } from "./picsum";
import type { HomeFeaturedProduct } from "./components/HomeFeaturedCarousel";

/** Data + actions needed by the Home screen. */
export type HomeViewModel = {
  // Layout flags
  homeMaxWidth: number;
  isWideWeb: boolean;

  // Images / tiles
  heroImage: CatalogProduct["image"] | undefined;
  apiCategoryTiles: Array<{
    id: string;
    label: string;
    query: string;
    image?: CatalogProduct["image"];
  }>;
  categoryTiles: Array<{
    id: string;
    label: string;
    query: string;
    image: CatalogProduct["image"] | undefined;
  }>;
  featuredProducts: HomeFeaturedProduct[];
  mainCategoriesTree: CategoryNodeDto[];

  // Navigation actions
  goToPLP: () => void;
  goToSale: () => void;
  goToNew: () => void;
  selectCategory: (categoryId: string) => void;
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
  width: number,
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

  // Fetch categories from API
  const { categories: categoryTree } = useCategories("root", 3);

  // Get main categories (top-level only, excluding root)
  const mainCategories = useMemo(() => {
    return getMainCategories(categoryTree);
  }, [categoryTree]);

  // Get first main category for featured products
  const firstCategoryId = useMemo(() => {
    if (mainCategories.length > 0) {
      return mainCategories[0].id;
    }
    return null;
  }, [mainCategories]);

  // Fetch featured products from first category
  const { products: apiProducts } = useProducts(
    firstCategoryId || "",
    undefined,
    12,
  );

  // Use API products if available, fallback to mock data
  const currentProducts = useMemo(() => {
    return apiProducts.length > 0 ? apiProducts : products;
  }, [apiProducts]);

  const heroImage = useMemo(() => {
    return resizePicsumSource(
      currentProducts[0]?.image,
      heroSize.w,
      heroSize.h,
    );
  }, [currentProducts, heroSize.h, heroSize.w, resizePicsumSource]);

  const featuredProducts = useMemo((): HomeFeaturedProduct[] => {
    const featured = currentProducts.slice(0, 10);
    return featured
      .filter((p) => p.image !== undefined)
      .map((p) => ({
        ...p,
        image: resizePicsumSource(p.image, carouselSize.w, carouselSize.h)!,
      }));
  }, [currentProducts, carouselSize.h, carouselSize.w, resizePicsumSource]);

  // Build API category tiles from fetched categories (main categories only)
  // Format: { id, label, query, image } to match HomeCategoryGrid expectations
  const apiCategoryTiles = useMemo(() => {
    return mainCategories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      query: cat.id, // Use category ID as the query
      image: undefined as CatalogProduct["image"] | undefined,
    }));
  }, [mainCategories]);

  // Fallback category tiles from mock data
  const representativeByCategory = useMemo(() => {
    const map = new Map<string, Product | CatalogProduct>();
    for (const product of currentProducts) {
      if (!product?.categoryId) continue;
      if (!map.has(product.categoryId)) {
        map.set(product.categoryId, product);
      }
    }
    return map;
  }, [currentProducts]);

  const categoryTiles = useMemo(() => {
    return categories.map((c) => {
      const representative = representativeByCategory.get(c.id);
      return {
        ...c,
        image: resizePicsumSource(
          representative?.image,
          tileSize.w,
          tileSize.h,
        ),
      };
    });
  }, [representativeByCategory, resizePicsumSource, tileSize.h, tileSize.w]);

  const goToPLP = useCallback(() => navigation.navigate("PLP"), [navigation]);
  const goToSale = useCallback(
    () => navigation.navigate("PLP", { q: "sale" }),
    [navigation],
  );
  const goToNew = useCallback(
    () => navigation.navigate("PLP", { q: "new" }),
    [navigation],
  );
  const selectCategory = useCallback(
    (categoryId: string) => navigation.navigate("PLP", { q: categoryId }),
    [navigation],
  );
  const openProduct = useCallback(
    (id: string) => navigation.navigate("PDP", { id }),
    [navigation],
  );

  return {
    homeMaxWidth,
    isWideWeb,

    heroImage,
    apiCategoryTiles,
    categoryTiles,
    featuredProducts,
    mainCategoriesTree: mainCategories,

    goToPLP,
    goToSale,
    goToNew,
    selectCategory,
    openProduct,

    categories,
  };
}
