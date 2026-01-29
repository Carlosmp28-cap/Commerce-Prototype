import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  lazy,
  Suspense,
} from "react";
import {
  FlatList,
  View,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import { useProductsPaginated } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import type { Product } from "../models/Product";
import { createStyles } from "./PLP.styles";
import {
  sortProducts,
  type SortOption,
} from "../scripts/helpers/productHelpers";
import EmptyState from "./productListingPage/components/EmptyState";
import Footer from "../components/Footer";
import Text from "../components/Text";
import SubcategoryChips from "./productListingPage/components/SubcategoryChips";
import { usePlpCategorySelection } from "./productListingPage/hooks/usePlpCategorySelection";
const ProductCard = lazy(
  () => import("./productListingPage/components/ProductCard"),
);

import PLPHeaderWeb from "./productListingPage/PLPHeader.web";
import PLPHeaderNative from "./productListingPage/PLPHeader.native";
const PLPHeader = Platform.OS === "web" ? PLPHeaderWeb : PLPHeaderNative;

type Props = NativeStackScreenProps<RootStackParamList, "PLP">;

export default function PLPScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const q = route.params?.q;

  const numColumns = useMemo(() => {
    if (Platform.OS === "web") return 4;
    if (width >= 720) return 3;
    if (width >= 540) return 3;
    return 2;
  }, [width]);

  const [selectedSort, setSelectedSort] = useState<SortOption>("name-asc");

  // Fetch categories to determine which category to use
  const {
    categories: categoryTree,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const { categoryId, subcategories, showSubcategories } =
    usePlpCategorySelection(categoryTree, q);

  // Fetch products from the determined category with pagination
  const {
    products: rawProducts,
    loading: productsLoading,
    error: productsError,
    hasMore,
    loadMore,
    isLoadingMore,
    total: totalProducts,
    offset,
    goToPage,
  } = useProductsPaginated(
    categoryId || "",
    undefined, // q is used for category selection, not keyword search
    25, // Request 25 products per page (SFCC API limit)
  );

  // Pagination helpers
  const pageSize = 25;
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const products = useMemo(
    () => sortProducts(rawProducts, selectedSort),
    [rawProducts, selectedSort],
  );

  const styles = useMemo(
    () => createStyles(theme, width, numColumns),
    [theme, width, numColumns],
  );

  const handleProductPress = useCallback(
    (id: string) => {
      navigation.navigate("PDP", { id });
    },
    [navigation],
  );

  const handleCategorySelect = useCallback(
    (categoryIdOrName: string) => {
      navigation.setParams({ q: categoryIdOrName || undefined });
    },
    [navigation],
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <Suspense fallback={null}>
        <ProductCard
          product={item}
          onPress={() => handleProductPress(item.id)}
          imageStyle={styles.image}
          containerStyle={styles.itemContainer}
        />
      </Suspense>
    ),
    [handleProductPress, styles.image, styles.itemContainer],
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        query={q}
        containerStyle={styles.emptyContainer}
        textStyle={styles.emptyText}
      />
    ),
    [q, styles.emptyContainer, styles.emptyText],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Products — CommercePrototype";

      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute(
        "content",
        "See all available products, filter by category, and sort as you wish in our online store.",
      );

      const ensure = (name: string, content: string) => {
        let tag = document.querySelector(`meta[property='${name}']`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", name);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      ensure("og:title", "Products — CommercePrototype");
      ensure(
        "og:description",
        "See all available products, filter by category, and sort as you wish in our online store.",
      );
    }
  }, []);

  // Show loading state
  const loading = categoriesLoading || productsLoading;
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>
          {categoriesLoading ? "Loading categories..." : "Loading products..."}
        </Text>
      </View>
    );
  }

  // Show error state
  const error = categoriesError || productsError;
  if (error) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.danger,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          Please check that the backend is running at http://localhost:5035
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <PLPHeader
        query={q}
        productCount={products.length}
        headerStyle={styles.header}
        titleStyle={styles.title}
        countStyle={styles.resultCount}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        onCategorySelect={handleCategorySelect}
      />

      <FlatList
        key={`flatlist-${numColumns}-${Math.floor(width / 50)}`}
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={numColumns}
        contentContainerStyle={[styles.list, { flexGrow: 1 }]}
        columnWrapperStyle={styles.row}
        renderItem={renderProduct}
        ListHeaderComponent={
          showSubcategories ? (
            <SubcategoryChips
              subcategories={subcategories}
              onSelectCategory={handleCategorySelect}
            />
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          <View style={{ width: "100%", paddingVertical: 16 }}>
            {/* Pagination controls: Prev, page numbers, Next */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Pressable
                onPress={() => {
                  if (currentPage > 1) goToPage(currentPage - 1);
                }}
                disabled={currentPage === 1}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginHorizontal: 6,
                    borderRadius: 6,
                    backgroundColor:
                      currentPage === 1
                        ? theme.colors.surface
                        : pressed
                          ? theme.colors.primaryContainer
                          : theme.colors.primary,
                    opacity: currentPage === 1 ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.colors.onPrimary }}>Prev</Text>
              </Pressable>

              {/* Page number window (up to 5 pages centered on current) */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {(() => {
                  const windowSize = 5;
                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + windowSize - 1);
                  if (end - start < windowSize - 1) {
                    start = Math.max(1, end - windowSize + 1);
                  }
                  const pages = [];
                  for (let p = start; p <= end; p++) pages.push(p);
                  return pages.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => goToPage(p)}
                      style={({ pressed }) => [
                        {
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          marginHorizontal: 4,
                          borderRadius: 6,
                          backgroundColor:
                            p === currentPage
                              ? theme.colors.primary
                              : pressed
                                ? theme.colors.primaryContainer
                                : theme.colors.surface,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            p === currentPage
                              ? theme.colors.onPrimary
                              : theme.colors.text,
                          fontWeight: p === currentPage ? "700" : "400",
                        }}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ));
                })()}
              </View>

              <Pressable
                onPress={() => {
                  if (currentPage < totalPages) goToPage(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    marginHorizontal: 6,
                    borderRadius: 6,
                    backgroundColor:
                      currentPage === totalPages
                        ? theme.colors.surface
                        : pressed
                          ? theme.colors.primaryContainer
                          : theme.colors.primary,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={{ color: theme.colors.onPrimary }}>Next</Text>
              </Pressable>
            </View>

            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                Showing page {currentPage} of {totalPages} — {products.length}{" "}
                of {totalProducts} products
              </Text>
            </View>

            <View style={{ marginHorizontal: -8 }}>
              <Footer />
            </View>
          </View>
        }
      />
    </View>
  );
}
