import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { CartItem } from "../models/CartItem";

// Cart state: useContext + useReducer with persistence (AsyncStorage/MMKV).
// Actions: add, remove, updateQty, clear. Rehydrate on app start.

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
    // TODO: rehydrate from storage on mount
  }, []);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
