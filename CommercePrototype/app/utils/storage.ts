import type { CartItem } from "../models/CartItem";

// Storage wrapper para persistir dados
// Implementação com fallback em memória
// Para usar AsyncStorage em produção, instale: @react-native-async-storage/async-storage

const CART_KEY = "@commerce_cart";

// Fallback em memória (durante sessão)
let inMemoryStorage: Record<string, string> = {};

/**
 * Load cart from storage
 */
export const loadCart = async (): Promise<CartItem[] | null> => {
  try {
    const cartJson = inMemoryStorage[CART_KEY];
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
    inMemoryStorage[CART_KEY] = JSON.stringify(items);
  } catch (error) {
    console.warn("Error saving cart to storage:", error);
  }
};

/**
 * Clear cart from storage
 */
export const clearCartStorage = async (): Promise<void> => {
  try {
    delete inMemoryStorage[CART_KEY];
  } catch (error) {
    console.warn("Error clearing cart from storage:", error);
  }
};

/**
 * Generic storage helpers
 */
export const getItem = async (key: string): Promise<any> => {
  try {
    const value = inMemoryStorage[key];
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn(`Error getting item '${key}' from storage:`, error);
    return null;
  }
};

export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    inMemoryStorage[key] = JSON.stringify(value);
  } catch (error) {
    console.warn(`Error setting item '${key}' in storage:`, error);
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    delete inMemoryStorage[key];
  } catch (error) {
    console.warn(`Error removing item '${key}' from storage:`, error);
  }
};
