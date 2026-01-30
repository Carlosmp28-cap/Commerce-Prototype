import type { ImageSourcePropType } from "react-native";

export const categories = [
  { id: "new", label: "New", query: "new" },
  { id: "men", label: "Men", query: "men" },
  { id: "women", label: "Women", query: "women" },
  { id: "sale", label: "Sale", query: "sale" },
  { id: "new arrivals", label: "New Arrivals", query: "arrivals" },
];

const placeholderImage = (seed: string): ImageSourcePropType => ({
  uri: `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/800`,
});

export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  quantityAvailable: number;
  categoryId: string;
  image: ImageSourcePropType;
  images?: ImageSourcePropType[];
  description?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  shipping?: { shippingType?: string; estimatedDays?: string };
  details: { title: string; paragraphs: string[] };
};

export const products: CatalogProduct[] = [
  {
    id: "sku-new-001",
    name: "Lightweight Tee",
    price: 18.99,
    quantityAvailable: 42,
    categoryId: "new",
    image: placeholderImage("sku-new-001"),
    shipping: { shippingType: "Standard shipping", estimatedDays: "3-5 days" },
    details: { title: "Details", paragraphs: ["A lightweight tee."] },
  },
  {
    id: "sku-new-003",
    name: "Running Sneaker",
    price: 89.0,
    quantityAvailable: 6,
    categoryId: "new",
    image: placeholderImage("sku-new-003"),
    details: { title: "Details", paragraphs: ["Sneaker."] },
  },
  {
    id: "sku-men-001",
    name: "Men's Polo",
    price: 34.99,
    quantityAvailable: 23,
    categoryId: "men",
    image: placeholderImage("sku-men-001"),
    details: { title: "Details", paragraphs: ["Polo."] },
  },
  {
    id: "sku-women-004",
    name: "Women's Dress",
    price: 59.0,
    quantityAvailable: 12,
    categoryId: "women",
    image: placeholderImage("sku-women-004"),
    details: { title: "Details", paragraphs: ["Dress."] },
  },
  {
    id: "sku-sale-002",
    name: "Sale Item",
    price: 9.99,
    quantityAvailable: 5,
    categoryId: "sale",
    image: placeholderImage("sku-sale-002"),
    details: { title: "Details", paragraphs: ["Sale."] },
  },
];

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getProductsByQuery = (q?: string) => {
  const normalized = (q ?? "").trim().toLowerCase();
  if (!normalized) return products;
  const match = categories.find((c) => c.query === normalized);
  if (match) return products.filter((p) => p.categoryId === match.id);
  return products.filter((p) => p.name.toLowerCase().includes(normalized));
};

export const getFeaturedProducts = () => {
  return [
    getProductById("sku-new-003"),
    getProductById("sku-men-001"),
    getProductById("sku-women-004"),
    getProductById("sku-sale-002"),
    getProductById("sku-new-001"),
  ].filter(Boolean) as CatalogProduct[];
};
