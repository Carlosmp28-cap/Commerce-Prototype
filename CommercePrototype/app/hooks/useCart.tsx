/**
 * useCart hook - Re-exported from CartContext
 *
 * This hook provides:
 * - items: CartItem[] - All items in the cart
 * - itemCount: number - Total unique items
 * - totalQuantity: number - Sum of all quantities
 * - totalPrice: number - Total price of all items
 * - addItem(product, quantity) - Add/increment product in cart
 * - removeItem(productId) - Remove product from cart
 * - updateQuantity(productId, quantity) - Update product quantity
 * - clearCart() - Clear all items from cart
 */

export { useCart, CartProvider } from "../store/CartContext";
export type { CartAction } from "../store/CartContext";
