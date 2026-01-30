// Centralized app types and shared enums
import type { Product as ProductModel } from "../models/Product";
import type { CartItem as CartItemModel } from "../models/CartItem";
import type { RootStackParamList as _RootStackParamList } from "../navigation";

export type { ProductModel as Product };
export type { CartItemModel as CartItem };

// Re-export navigation param list
export type RootStackParamList = _RootStackParamList;

// Sorting options used across PLP
export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

// Payment methods
export enum PaymentMethod {
  Card = "card",
  PayPal = "paypal",
}

export type PaymentMethodType = `${PaymentMethod}`;

// Common DTOs can be re-exported from `app/models` when available
export * from "../models";
