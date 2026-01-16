import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { CartItem } from "../models/CartItem";

/**
 * Cart state (prototype).
 *
 * We keep cart state in a Context Provider so any screen can access it.
 * In production, we'd also persist it (AsyncStorage/MMKV) and implement actions
 * (add/remove/updateQty/clear) plus rehydration on app start.
 */

type State = { items: CartItem[] };

const initialState: State = { items: [] };

function reducer(state: State, action: any): State {
  switch (action.type) {
    // TODO: implement add/remove/update logic
    default:
      return state;
  }
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // TODO: rehydrate from storage on mount.
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  // Intentionally returns a minimal shape for now.
  // Once actions are implemented, we'll export typed helpers (e.g. addItem()).
  return useContext(CartContext);
}
