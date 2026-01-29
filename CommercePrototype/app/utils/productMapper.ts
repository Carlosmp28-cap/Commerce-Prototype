import type { Product } from "../models/Product";
import type {
  ProductSummaryDto,
  ProductDetailDto,
  ProductVariantDto,
} from "../models";
import type { CategoryId } from "../data/catalog";

/**
 * Map backend ProductSummaryDto to frontend Product model
 */
export function mapProductSummary(dto: ProductSummaryDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    quantityAvailable: 0, // Not provided in summary, will show as unavailable
    categoryId: (dto.categoryId as CategoryId) || "new",
    image: dto.imageUrl ? { uri: dto.imageUrl } : undefined,
    rating: dto.rating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined,
  };
}

/**
 * Map backend ProductDetailDto to frontend Product model
 */
export function mapProductDetail(dto: ProductDetailDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    price: dto.price,
    quantityAvailable: dto.quantityAvailable,
    categoryId: (dto.categoryId as CategoryId) || "new",
    image: dto.imageUrl ? { uri: dto.imageUrl } : undefined,
    images: dto.gallery?.map((url) => ({ uri: url })),
    description: dto.description ?? undefined,
    rating: dto.rating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined,
    features: dto.features ?? undefined,
    productType: dto.productType ?? undefined,
    masterId: dto.masterId ?? undefined,
    variants:
      dto.variants?.map((v) => ({
        id: v.id,
        orderable: v.orderable ?? undefined,
        variationValues: v.variationValues ?? undefined,
      })) ?? undefined,
    shipping:
      dto.shippingType || dto.shippingEstimate
        ? {
            shippingType: dto.shippingType ?? undefined,
            estimatedDays: dto.shippingEstimate ?? undefined,
          }
        : undefined,
  };
}
