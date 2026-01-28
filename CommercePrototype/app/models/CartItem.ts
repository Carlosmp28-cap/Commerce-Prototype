import type { Product } from "./Product";

export type CartItem = {
  itemId?: string;
  product: Product;
  quantity: number;
};
