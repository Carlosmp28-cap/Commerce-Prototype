import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartItem } from "../models/CartItem";

const CART_STORAGE_KEY = "@commerce_cart";

export const getItem = async (key: string) => {
  try {
    const item = await AsyncStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
};

export const setItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
  }
};

export const saveCart = async (items: CartItem[]) => {
  try {
    await setItem(CART_STORAGE_KEY, items);
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

export const loadCart = async (): Promise<CartItem[] | null> => {
  try {
    const cart = await getItem(CART_STORAGE_KEY);
    return cart || [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};
