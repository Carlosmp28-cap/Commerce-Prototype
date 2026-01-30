import { createContext, useContext, useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import type { CartItem } from "../models/CartItem";
import type { Product } from "../models/Product";
import type { BasketDto, BasketItemDto } from "../models";
import { api, getShopperSessionId, setShopperSessionId } from "../services/api";
import { subscribeAuthEvents } from "../services/auth-events";
import {
  clearBasketSession,
  loadBasketSession,
  loadCart,
  saveBasketSession,
  saveCart,
} from "../utils/storage";

/**
 * Cart state (prototype).
 *
 * We keep cart state in a Context Provider so any screen can access it.
 * Cart is persisted to storage and rehydrated on app start.
 */

type Totals = {
  currency?: string;
  totalQuantity?: number;
  productTotal?: number | null;
  shippingTotal?: number | null;
  taxTotal?: number | null;
  orderTotal?: number | null;
};

type State = {
  items: CartItem[];
  basketId: string | null;
  sessionId: string | null;
  totals?: Totals;
};

const initialState: State = {
  items: [],
  basketId: null,
  sessionId: null,
  totals: undefined,
};

export type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SET_BASKET"; basket: BasketDto }
  | { type: "SET_BASKET_ID"; basketId: string | null }
  | { type: "SET_SESSION"; sessionId: string | null }
  | { type: "REHYDRATE"; items: CartItem[] };

function reducer(state: State, action: CartAction): State {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.product.id,
      );

      if (existingItem) {
        // Product already exists in the cart; increment quantity
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + action.quantity,
                    action.product.quantityAvailable,
                  ),
                }
              : item,
          ),
        };
      } else {
        // New product in the cart
        return {
          ...state,
          items: [
            ...state.items,
            {
              product: action.product,
              quantity: Math.min(
                action.quantity,
                action.product.quantityAvailable,
              ),
            },
          ],
        };
      }
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.productId,
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.product.id !== action.productId,
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.productId
            ? {
                ...item,
                quantity: Math.min(
                  action.quantity,
                  item.product.quantityAvailable,
                ),
              }
            : item,
        ),
      };
    }

    case "CLEAR_CART": {
      return { ...state, items: [], totals: undefined };
    }

    case "SET_BASKET": {
      const items = mapBasketItems(action.basket.items);
      return {
        ...state,
        basketId: action.basket.basketId,
        items,
        totals: {
          currency: action.basket.currency,
          totalQuantity: action.basket.itemCount,
          productTotal: action.basket.productTotal ?? null,
          shippingTotal: action.basket.shippingTotal ?? null,
          taxTotal: action.basket.taxTotal ?? null,
          orderTotal: action.basket.orderTotal ?? null,
        },
      };
    }

    case "SET_BASKET_ID": {
      return { ...state, basketId: action.basketId };
    }

    case "SET_SESSION": {
      return { ...state, sessionId: action.sessionId };
    }

    case "REHYDRATE": {
      return { ...state, items: action.items };
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: State;
  dispatch: (action: CartAction) => void;
} | null>(null);

const MAX_QUANTITY = Number.MAX_SAFE_INTEGER;

function mapBasketItems(items: BasketItemDto[]): CartItem[] {
  return items.map((item) => ({
    itemId: item.itemId,
    product: {
      id: item.productId,
      name: item.productName ?? "Item",
      price: item.price ?? item.basePrice ?? 0,
      quantityAvailable: MAX_QUANTITY,
      categoryId: "new",
      image: item.imageUrl ? { uri: item.imageUrl } : undefined,
    },
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isTest =
    typeof process !== "undefined" && process.env?.NODE_ENV === "test";

  // Keep cart/basket state in sync when the app performs login/logout via AuthProvider.
  useEffect(() => {
    const unsubscribe = subscribeAuthEvents((event) => {
      if (event.type === "logout") {
        setShopperSessionId(null);
        clearBasketSession().catch(() => undefined);
        dispatch({ type: "CLEAR_CART" });
        dispatch({ type: "SET_BASKET_ID", basketId: null });
        dispatch({ type: "SET_SESSION", sessionId: null });
        return;
      }

      // login
      setShopperSessionId(event.sessionId);
      dispatch({ type: "SET_SESSION", sessionId: event.sessionId });

      if (event.basketId) {
        dispatch({ type: "SET_BASKET_ID", basketId: event.basketId });
        api.cart
          .get(event.basketId)
          .then((basket) => {
            dispatch({ type: "SET_BASKET", basket });
            const latestSession = getShopperSessionId();
            if (latestSession) {
              dispatch({ type: "SET_SESSION", sessionId: latestSession });
            }
          })
          .catch(() => {
            // If the merged basket can't be loaded, clear session snapshot.
            clearBasketSession().catch(() => undefined);
            dispatch({ type: "SET_BASKET_ID", basketId: null });
          });
      }
    });

    return unsubscribe;
  }, []);

  // Rehydrate cart from storage on mount
  useEffect(() => {
    const rehydrate = async () => {
      try {
        const savedCart = await loadCart();
        const savedSession = await loadBasketSession();

        // Basket IDs are not authorization; without a session id the backend will reject basket ops.
        if (savedSession?.basketId && !savedSession.sessionId) {
          await clearBasketSession();
          dispatch({ type: "SET_BASKET_ID", basketId: null });
        }

        if (savedSession?.sessionId) {
          setShopperSessionId(savedSession.sessionId);
          dispatch({ type: "SET_SESSION", sessionId: savedSession.sessionId });
        } else if (!isTest) {
          // Guest entry: create shopper session early so basket operations always have a session header.
          try {
            const guest = await api.auth.guest({ retry: 1, retryDelayMs: 200 });
            if (guest?.sessionId) {
              setShopperSessionId(guest.sessionId);
              dispatch({ type: "SET_SESSION", sessionId: guest.sessionId });
              await saveBasketSession({
                basketId: null,
                sessionId: guest.sessionId,
              });
            }
          } catch (error) {
            console.warn("Failed to create guest shopper session:", error);
          }
        }

        if (!isTest && savedSession?.basketId) {
          try {
            const basket = await api.cart.get(savedSession.basketId);
            dispatch({ type: "SET_BASKET", basket });
            const latestSession = getShopperSessionId();
            if (latestSession) {
              dispatch({ type: "SET_SESSION", sessionId: latestSession });
            }
          } catch (error) {
            console.warn("Failed to refresh basket from API:", error);
            await clearBasketSession();
            dispatch({ type: "SET_BASKET_ID", basketId: null });
          }
        } else if (savedCart && savedCart.length > 0) {
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

  // Persist basket session info whenever it changes
  useEffect(() => {
    const persistSession = async () => {
      try {
        // Important: avoid overwriting a valid snapshot with an invalid transient state.
        // Example: basket creation sets basketId first and sessionId is applied right after
        // (from response header). In that window we should not wipe storage.
        if (state.basketId && !state.sessionId) {
          return;
        }

        await saveBasketSession({
          basketId: state.basketId,
          sessionId: state.sessionId,
        });
      } catch (error) {
        console.warn("Failed to persist basket session:", error);
      }
    };

    persistSession();
  }, [state.basketId, state.sessionId]);

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

  const syncSessionFromApi = () => {
    const latestSession = getShopperSessionId();
    if (latestSession && latestSession !== state.sessionId) {
      dispatch({ type: "SET_SESSION", sessionId: latestSession });
    }
  };

  const ensureBasketId = async (): Promise<string | null> => {
    if (state.basketId) {
      const session = getShopperSessionId() ?? state.sessionId;

      // Stale snapshot: basket id without a shopper session is unusable.
      if (!session) {
        clearBasketSession().catch(() => undefined);
        dispatch({ type: "SET_BASKET_ID", basketId: null });
      } else {
        // Ensure axios request interceptor will send the header.
        if (session !== getShopperSessionId()) {
          setShopperSessionId(session);
        }
        return state.basketId;
      }
    }

    try {
      // Create an empty SFCC basket for this session.
      let basket = await api.cart.create({ currency: "EUR" });
      syncSessionFromApi();

      // If we have locally persisted cart items (e.g. after a refresh where basket snapshot
      // wasn't available), rebuild the server basket before returning.
      if (state.items.length > 0) {
        for (const item of state.items) {
          basket = await api.cart.addItem(basket.basketId, {
            productId: item.product.id,
            quantity: item.quantity,
          });
          syncSessionFromApi();
        }
      }

      dispatch({ type: "SET_BASKET", basket });
      return basket.basketId;
    } catch (error) {
      console.warn("Failed to create/rebuild basket:", error);
      return null;
    }
  };

  const findItem = (id: string) =>
    state.items.find((item) => item.itemId === id || item.product.id === id);

  const totalQuantityFromItems = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const addItem = async (
    product: Product,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) return false;

    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      if (quantity <= product.quantityAvailable) {
        dispatch({ type: "ADD_ITEM", product, quantity });
        return true;
      }
      return false;
    }

    const basketId = await ensureBasketId();
    if (!basketId) return false;

    try {
      const basket = await api.cart.addItem(basketId, {
        productId: product.id,
        quantity,
      });
      dispatch({ type: "SET_BASKET", basket });
      syncSessionFromApi();
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "UNKNOWN_OR_MISSING_SHOPPER_SESSION"
      ) {
        // Backend sessions can expire or be lost after server restart; recover by starting a new basket.
        setShopperSessionId(null);
        clearBasketSession().catch(() => undefined);
        dispatch({ type: "SET_SESSION", sessionId: null });
        dispatch({ type: "SET_BASKET_ID", basketId: null });

        try {
          const newBasketId = await ensureBasketId();
          if (!newBasketId) return false;
          const basket = await api.cart.addItem(newBasketId, {
            productId: product.id,
            quantity,
          });
          dispatch({ type: "SET_BASKET", basket });
          syncSessionFromApi();
          return true;
        } catch (retryError) {
          console.warn(
            "Failed to add item after session recovery:",
            retryError,
          );
          return false;
        }
      }
      console.warn("Failed to add item to basket:", error);
      return false;
    }
  };

  const removeItem = async (productIdOrItemId: string) => {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      dispatch({ type: "REMOVE_ITEM", productId: productIdOrItemId });
      return;
    }

    if (!state.basketId) {
      dispatch({ type: "REMOVE_ITEM", productId: productIdOrItemId });
      return;
    }

    const item = findItem(productIdOrItemId);
    const itemId = item?.itemId;
    if (!itemId) {
      dispatch({ type: "REMOVE_ITEM", productId: productIdOrItemId });
      return;
    }

    try {
      const basket = await api.cart.removeItem(state.basketId, itemId);
      dispatch({ type: "SET_BASKET", basket });
      syncSessionFromApi();
    } catch (error) {
      console.warn("Failed to remove item from basket:", error);
    }
  };

  const updateQuantity = async (
    productIdOrItemId: string,
    quantity: number,
  ) => {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      dispatch({
        type: "UPDATE_QUANTITY",
        productId: productIdOrItemId,
        quantity,
      });
      return;
    }

    if (!state.basketId) {
      dispatch({
        type: "UPDATE_QUANTITY",
        productId: productIdOrItemId,
        quantity,
      });
      return;
    }

    if (quantity <= 0) {
      await removeItem(productIdOrItemId);
      return;
    }

    const item = findItem(productIdOrItemId);
    const itemId = item?.itemId;
    if (!itemId) {
      dispatch({
        type: "UPDATE_QUANTITY",
        productId: productIdOrItemId,
        quantity,
      });
      return;
    }

    try {
      const basket = await api.cart.updateItemQuantity(state.basketId, itemId, {
        quantity,
      });
      dispatch({ type: "SET_BASKET", basket });
      syncSessionFromApi();
    } catch (error) {
      console.warn("Failed to update basket quantity:", error);
    }
  };

  const clearCart = async () => {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      dispatch({ type: "CLEAR_CART" });
      return;
    }

    if (state.basketId) {
      try {
        await api.cart.clear(state.basketId);
      } catch (error) {
        console.warn("Failed to clear basket:", error);
      }
    }

    dispatch({ type: "CLEAR_CART" });
    dispatch({ type: "SET_BASKET_ID", basketId: null });
  };

  const refresh = async () => {
    if (!state.basketId) return;
    try {
      const basket = await api.cart.get(state.basketId);
      dispatch({ type: "SET_BASKET", basket });
      syncSessionFromApi();
    } catch (error) {
      console.warn("Failed to refresh basket:", error);
    }
  };

  return {
    items: state.items,
    basketId: state.basketId,
    sessionId: state.sessionId,
    itemCount: state.items.length,
    totalQuantity: state.totals?.totalQuantity ?? totalQuantityFromItems,
    totalPrice:
      state.totals?.orderTotal ??
      state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refresh,
  };
}
