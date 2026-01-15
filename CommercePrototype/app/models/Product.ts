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
  description?: string;
};

// Extend with attributes, variants and pricing models as needed.
