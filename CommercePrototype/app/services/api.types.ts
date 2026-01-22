/**
 * TypeScript types matching backend DTOs
 */

export interface ProductSummaryDto {
  id: string;
  name: string;
  price: number;
  categoryId?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export interface ProductDetailDto {
  id: string;
  name: string;
  price: number;
  categoryId?: string | null;
  quantityAvailable: number;
  description?: string | null;
  imageUrl?: string | null;
  gallery?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  features?: string[] | null;
  shippingType?: string | null;
  shippingEstimate?: string | null;
}

export interface ProductSearchResultDto {
  items: ProductSummaryDto[];
  total: number;
  count: number;
  offset: number;
}

export interface CategoryNodeDto {
  id: string;
  name: string;
  parentId?: string | null;
  children: CategoryNodeDto[];
}

export interface ApiError {
  error: string;
  details?: string;
}
