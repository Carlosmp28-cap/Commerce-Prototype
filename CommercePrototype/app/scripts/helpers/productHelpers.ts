// ProductHelpers operate on either backend `Product` or test fixtures.
import type { Product } from "../../models/Product";
import type { SortOption } from "../../types";
import { SORT_OPTIONS } from "../../types";
// CatalogProduct previously used in fixtures; prefer Product-like type instead of `any`.
type CatalogProduct = Product | { name: string; price: number };

/**
 * Sort products based on the selected option
 * Works with both Product and CatalogProduct types
 */
type ProductLike = { name: string; price: number };

export const sortProducts = <T extends ProductLike>(
  products: T[],
  sortBy: SortOption,
): T[] => {
  const sorted = [...products];

  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
};

// Use centralized SORT_OPTIONS from app/types
