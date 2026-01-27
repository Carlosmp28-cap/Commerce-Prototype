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

export interface CategoryNodeDto {
  id: string;
  name: string;
  parentId?: string | null;
  children: CategoryNodeDto[];
}

export interface BasketItemDto {
  itemId: string;
  productId: string;
  productName?: string | null;
  quantity: number;
  price?: number | null;
  basePrice?: number | null;
  imageUrl?: string | null;
}

export interface BasketDto {
  basketId: string;
  currency: string;
  items: BasketItemDto[];
  itemCount: number;
  productTotal?: number | null;
  shippingTotal?: number | null;
  taxTotal?: number | null;
  orderTotal?: number | null;
}

export interface CreateBasketRequestDto {
  currency?: string | null;
}

export interface AddBasketItemRequestDto {
  productId: string;
  quantity: number;
}

export interface UpdateBasketItemQuantityRequestDto {
  quantity: number;
}

export interface LoginRequestDto {
  username: string;
  password: string;
  basketId?: string | null;
}

export interface ShopperSessionDto {
  sessionId: string;
  customerId?: string | null;
  authType: string;
  basketId?: string | null;
  jwtToken?: string | null;
}

export interface ApiError {
  error: string;
  details?: string;
}
