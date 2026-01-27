import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartItem } from "../models/CartItem";

// Storage wrapper para persistir dados
// Implementação baseada em AsyncStorage com fallback em memória

const CART_KEY = "@commerce_cart";
const BASKET_SESSION_KEY = "@commerce_basket_session";

// Fallback em memória (durante sessão)
let inMemoryStorage: Record<string, string> = {};

const getFromStorage = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (typeof value === "string") return value;
  } catch (error) {
    console.warn(`Error reading '${key}' from AsyncStorage:`, error);
  }

  return inMemoryStorage[key] ?? null;
};

const setInStorage = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch (error) {
    console.warn(`Error writing '${key}' to AsyncStorage:`, error);
  }

  inMemoryStorage[key] = value;
};

const removeFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing '${key}' from AsyncStorage:`, error);
  }

  delete inMemoryStorage[key];
};

/**
 * Load cart from storage
 */
export const loadCart = async (): Promise<CartItem[] | null> => {
  try {
    const cartJson = await getFromStorage(CART_KEY);
    return cartJson ? JSON.parse(cartJson) : null;
  } catch (error) {
    console.warn("Error loading cart from storage:", error);
    return null;
  }
};

/**
 * Save cart to storage
 */
export const saveCart = async (items: CartItem[]): Promise<void> => {
  try {
    await setInStorage(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn("Error saving cart to storage:", error);
  }
};

/**
 * Clear cart from storage
 */
export const clearCartStorage = async (): Promise<void> => {
  try {
    await removeFromStorage(CART_KEY);
  } catch (error) {
    console.warn("Error clearing cart from storage:", error);
  }
};

/**
 * Generic storage helpers
 */
export const getItem = async (key: string): Promise<any> => {
  try {
    const value = await getFromStorage(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Error getting item '${key}' from storage:`, error);
    return null;
  }
};

export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    await setInStorage(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting item '${key}' in storage:`, error);
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await removeFromStorage(key);
  } catch (error) {
    console.warn(`Error removing item '${key}' from storage:`, error);
  }
};

type BasketSessionSnapshot = {
  basketId: string | null;
  sessionId: string | null;
};

export const loadBasketSession = async (): Promise<BasketSessionSnapshot | null> => {
  return getItem(BASKET_SESSION_KEY);
};

export const saveBasketSession = async (
  snapshot: BasketSessionSnapshot,
): Promise<void> => {
  await setItem(BASKET_SESSION_KEY, snapshot);
};

export const clearBasketSession = async (): Promise<void> => {
  await removeItem(BASKET_SESSION_KEY);
};
