import type { AuthTokens } from "../models";
import { getItem, setItem, removeItem } from "../utils/storage";

const AUTH_TOKENS_KEY = "@commerce_auth_tokens";

export const loadAuthTokens = async (): Promise<AuthTokens | null> =>
  getItem(AUTH_TOKENS_KEY);

export const saveAuthTokens = async (tokens: AuthTokens): Promise<void> =>
  setItem(AUTH_TOKENS_KEY, tokens);

export const clearAuthTokens = async (): Promise<void> =>
  removeItem(AUTH_TOKENS_KEY);
