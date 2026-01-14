import type { ImageSourcePropType } from "react-native";
import type { CategoryId } from "../data/catalog";

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
  /** Shipping info */
  shipping?: {
    shippingType?: string;
    estimatedDays?: string;
  };
};

// Extend with attributes, variants and pricing models as needed.
