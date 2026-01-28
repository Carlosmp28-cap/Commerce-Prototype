import type { ImageSourcePropType } from "react-native";
import type { CategoryId } from "../data/catalog";

/**
 * Product shape used by the UI.
 *
 * In a production app, this would typically mirror the API/SDK contract (often
 * generated), while UI-only fields live in view models.
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  /** Stock available to sell (inventory). */
  quantityAvailable: number;
  /** Category this product belongs to (used for PLP filtering). */
  categoryId: CategoryId;
  /** Image for RN <Image source={...} />; supports both local require() and remote URLs. */
  image?: ImageSourcePropType;
  /** Multiple images for gallery */
  images?: ImageSourcePropType[];
  description?: string;
  /** Rating (0-5) */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Product features/tags */
  features?: string[];
  /** PDP details copy block (title + paragraphs). */
  details?: {
    title: string;
    paragraphs: string[];
  };
  /** Shipping info */
  shipping?: {
    shippingType?: string;
    estimatedDays?: string;
  };

  /** SFCC product type (e.g. master/variant/standard), when available. */
  productType?: string;

  /** Master product id when this is a variant, when available. */
  masterId?: string;

  /** Variant list for master products (used by PDP to force selection). */
  variants?: Array<{
    id: string;
    orderable?: boolean;
    variationValues?: Record<string, string>;
  }>;
};

// Extend with attributes, variants and pricing models as needed.
