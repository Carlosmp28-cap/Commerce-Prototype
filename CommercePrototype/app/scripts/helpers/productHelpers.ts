// ProductHelpers operate on either backend `Product` or test fixtures.
import type { Product } from "../../models/Product";
type CatalogProduct = any;

export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

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

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];
