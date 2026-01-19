import { useMemo, useCallback, useState } from "react";
import { FlatList, View, useWindowDimensions, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";
import { getProductsByQuery } from "../data/catalog";
import type { CatalogProduct } from "../data/catalog";
import { createStyles } from "./PLP.styles";
import ProductCard from "./productListingPage/components/ProductCard";
import EmptyState from "./productListingPage/components/EmptyState";
import {
  sortProducts,
  type SortOption,
} from "../scripts/helpers/productHelpers";
import Footer from "../components/Footer";

const PLPHeader =
  Platform.OS === "web"
    ? require("./productListingPage/PLPHeader.web").default
    : require("./productListingPage/PLPHeader.native").default;

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

  const rawProducts = useMemo(() => getProductsByQuery(q), [q]);
  const products = useMemo(
    () => sortProducts(rawProducts, selectedSort),
    [rawProducts, selectedSort]
  );
  const styles = useMemo(
    () => createStyles(theme, width, numColumns),
    [theme, width, numColumns]
  );

  const handleProductPress = useCallback(
    (id: string) => {
      navigation.navigate("PDP", { id });
    },
    [navigation]
  );

  const handleBackPress = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  const handleCategorySelect = useCallback(
    (query: string) => {
      navigation.setParams({ q: query || undefined });
    },
    [navigation]
  );

  const renderProduct = useCallback(
    ({ item }: { item: CatalogProduct }) => (
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        imageStyle={styles.image}
        containerStyle={styles.itemContainer}
      />
    ),
    [handleProductPress, styles.image, styles.itemContainer]
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        query={q}
        containerStyle={styles.emptyContainer}
        textStyle={styles.emptyText}
      />
    ),
    [q, styles.emptyContainer, styles.emptyText]
  );

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
        onBackPress={handleBackPress}
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
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
            <View style={{ marginHorizontal: -8 }}>
              <Footer />
            </View>
          </View>
        }
      />
    </View>
  );
}
