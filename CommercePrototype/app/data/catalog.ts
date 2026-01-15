/**
 * In-memory product catalog used by screens.
 *
 * This is intentionally local-only for the prototype. When we introduce a real
 * backend/API, this file becomes either:
 * - a mock/stub used by tests, or
 * - a fallback dataset used when offline.
 */
import type { ImageSourcePropType } from "react-native";

export type CategoryId = "new" | "men" | "women" | "sale";

export type Category = {
  id: CategoryId;
  label: string;
  query: string;
};

export const categories: Category[] = [
  { id: "new", label: "New", query: "new" },
  { id: "men", label: "Men", query: "men" },
  { id: "women", label: "Women", query: "women" },
  { id: "sale", label: "Sale", query: "sale" },
];

const placeholderImage = (seed: string): ImageSourcePropType => ({
  // Deterministic images per product, no local assets required.
  // picsum supports arbitrary seeds and returns a valid image for web + native.
  uri: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`,
});

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  categoryId: CategoryId;
  image: ImageSourcePropType;
  description?: string;
};

export const products: CatalogProduct[] = [
  // New (5)
  {
    id: "sku-new-001",
    name: "Lightweight Tee",
    price: 18.99,
    quantityAvailable: 42,
    categoryId: "new",
    image: placeholderImage("sku-new-001"),
  },
  {
    id: "sku-new-002",
    name: "Minimal Hoodie",
    price: 54.9,
    quantityAvailable: 11,
    categoryId: "new",
    image: placeholderImage("sku-new-002"),
  },
  {
    id: "sku-new-003",
    name: "Running Sneaker",
    price: 89.0,
    quantityAvailable: 6,
    categoryId: "new",
    image: placeholderImage("sku-new-003"),
  },
  {
    id: "sku-new-004",
    name: "Everyday Jeans",
    price: 62.5,
    quantityAvailable: 19,
    categoryId: "new",
    image: placeholderImage("sku-new-004"),
  },
  {
    id: "sku-new-005",
    name: "Windbreaker Jacket",
    price: 99.99,
    quantityAvailable: 4,
    categoryId: "new",
    image: placeholderImage("sku-new-005"),
  },

  // Men (5)
  {
    id: "sku-men-001",
    name: "Men's Polo",
    price: 34.99,
    quantityAvailable: 23,
    categoryId: "men",
    image: placeholderImage("sku-men-001"),
  },
  {
    id: "sku-men-002",
    name: "Chino Pants",
    price: 49.5,
    quantityAvailable: 9,
    categoryId: "men",
    image: placeholderImage("sku-men-002"),
  },
  {
    id: "sku-men-003",
    name: "Leather Belt",
    price: 24.0,
    quantityAvailable: 31,
    categoryId: "men",
    image: placeholderImage("sku-men-003"),
  },
  {
    id: "sku-men-004",
    name: "Oxford Shirt",
    price: 44.0,
    quantityAvailable: 13,
    categoryId: "men",
    image: placeholderImage("sku-men-004"),
  },
  {
    id: "sku-men-005",
    name: "Trail Sneaker",
    price: 92.0,
    quantityAvailable: 0,
    categoryId: "men",
    image: placeholderImage("sku-men-005"),
  },

  // Women (5)
  {
    id: "sku-women-001",
    name: "Women's Blouse",
    price: 39.99,
    quantityAvailable: 17,
    categoryId: "women",
    image: placeholderImage("sku-women-001"),
  },
  {
    id: "sku-women-002",
    name: "High-Waist Jeans",
    price: 69.0,
    quantityAvailable: 8,
    categoryId: "women",
    image: placeholderImage("sku-women-002"),
  },
  {
    id: "sku-women-003",
    name: "Soft Cardigan",
    price: 59.0,
    quantityAvailable: 5,
    categoryId: "women",
    image: placeholderImage("sku-women-003"),
  },
  {
    id: "sku-women-004",
    name: "Everyday Dress",
    price: 74.99,
    quantityAvailable: 12,
    categoryId: "women",
    image: placeholderImage("sku-women-004"),
  },
  {
    id: "sku-women-005",
    name: "Comfort Sneaker",
    price: 84.0,
    quantityAvailable: 2,
    categoryId: "women",
    image: placeholderImage("sku-women-005"),
  },

  // Sale (5)
  {
    id: "sku-sale-001",
    name: "Sale Tee",
    price: 12.99,
    quantityAvailable: 50,
    categoryId: "sale",
    image: placeholderImage("sku-sale-001"),
  },
  {
    id: "sku-sale-002",
    name: "Sale Hoodie",
    price: 39.99,
    quantityAvailable: 16,
    categoryId: "sale",
    image: placeholderImage("sku-sale-002"),
  },
  {
    id: "sku-sale-003",
    name: "Sale Jeans",
    price: 45.0,
    quantityAvailable: 7,
    categoryId: "sale",
    image: placeholderImage("sku-sale-003"),
  },
  {
    id: "sku-sale-004",
    name: "Sale Jacket",
    price: 69.0,
    quantityAvailable: 3,
    categoryId: "sale",
    image: placeholderImage("sku-sale-004"),
  },
  {
    id: "sku-sale-005",
    name: "Sale Sneaker",
    price: 59.0,
    quantityAvailable: 0,
    categoryId: "sale",
    image: placeholderImage("sku-sale-005"),
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getProductsByQuery = (q?: string) => {
  // Simple filtering to keep screens light. Swap for API query params later.
  if (!q) return products;
  const match = categories.find((c) => c.query === q);
  if (!match) return products;
  return products.filter((p) => p.categoryId === match.id);
};

export const getFeaturedProducts = () => {
  // Keep Home light: show a curated slice (still fully backed by the 20-product catalog)
  return [
    products.find((p) => p.id === "sku-new-003"),
    products.find((p) => p.id === "sku-men-001"),
    products.find((p) => p.id === "sku-women-004"),
    products.find((p) => p.id === "sku-sale-002"),
    products.find((p) => p.id === "sku-new-001"),
  ].filter(Boolean) as CatalogProduct[];
};
