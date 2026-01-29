/**
 * Product related DTOs
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
  productType?: string | null;
  masterId?: string | null;
  variants?: ProductVariantDto[] | null;
}

export interface ProductVariantDto {
  id: string;
  orderable?: boolean | null;
  variationValues?: Record<string, string> | null;
}

export interface ProductSearchResultDto {
  items: ProductSummaryDto[];
  total: number;
  count: number;
  offset: number;
}
