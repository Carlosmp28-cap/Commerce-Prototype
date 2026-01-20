import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { CartItem } from "../models/CartItem";
import type { Product } from "../models/Product";
import { loadCart, saveCart } from "../utils/storage";

/**
 * Cart state (prototype).
 *
 * We keep cart state in a Context Provider so any screen can access it.
 * Cart is persisted to storage and rehydrated on app start.
 */

type State = { items: CartItem[] };

const initialState: State = { items: [] };

export type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "REHYDRATE"; items: CartItem[] };

function reducer(state: State, action: CartAction): State {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.product.id
      );

      if (existingItem) {
        // Product already exists in the cart; increment quantity
        return {
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + action.quantity,
                    action.product.quantityAvailable
                  ),
                }
              : item
          ),
        };
      } else {
        // New product in the cart
        return {
          items: [
            ...state.items,
            {
              product: action.product,
              quantity: Math.min(
                action.quantity,
                action.product.quantityAvailable
              ),
            },
          ],
        };
      }
    }

    case "REMOVE_ITEM": {
      return {
        items: state.items.filter(
          (item) => item.product.id !== action.productId
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => item.product.id !== action.productId
          ),
        };
      }

      return {
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? {
                ...item,
                quantity: Math.min(
                  action.quantity,
                  item.product.quantityAvailable
                ),
              }
            : item
        ),
      };
    }

    case "CLEAR_CART": {
      return { items: [] };
    }

    case "REHYDRATE": {
      return { items: action.items };
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: State;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Rehydrate cart from storage on mount
  useEffect(() => {
    const rehydrate = async () => {
      try {
        const savedCart = await loadCart();
        if (savedCart && savedCart.length > 0) {
          dispatch({ type: "REHYDRATE", items: savedCart });
        }
      } catch (error) {
        console.warn("Failed to rehydrate cart from storage:", error);
      }
    };

    rehydrate();
  }, []);

  // Persist cart to storage whenever it changes
  useEffect(() => {
    const persist = async () => {
      try {
        await saveCart(state.items);
      } catch (error) {
        console.warn("Failed to persist cart to storage:", error);
      }
    };

    persist();
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const { state, dispatch } = context;

  return {
    items: state.items,
    itemCount: state.items.length,
    totalQuantity: state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: state.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),

    // Actions
    addItem: (product: Product, quantity: number) => {
      if (quantity > 0 && quantity <= product.quantityAvailable) {
        dispatch({ type: "ADD_ITEM", product, quantity });
      }
    },

    removeItem: (productId: string) => {
      dispatch({ type: "REMOVE_ITEM", productId });
    },

    updateQuantity: (productId: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
    },

    clearCart: () => {
      dispatch({ type: "CLEAR_CART" });
    },
  };
}
