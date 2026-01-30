/**
 * Basket / Cart DTOs
 */

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
