import {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { api, setAuthTokens, setShopperSessionId } from "../services/api";
import type { AuthTokens } from "../models";
import {
  loadAuthTokens,
  saveAuthTokens,
  clearAuthTokens,
} from "../services/auth-storage";
import { loadBasketSession } from "../utils/storage";
import { emitAuthEvent } from "../services/auth-events";

/**
 * Auth state (prototype).
 *
 * Centralizes authentication state so screens/components can reliably check
 * current user and perform sign-in/sign-out.
 *
 * TODO: implement using an auth service and persist tokens via storage.
 */

export type AuthUser = {
  id: string;
  email: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const rehydrate = async () => {
      const tokens = await loadAuthTokens();
      if (tokens?.accessToken) {
        setAuthTokens(tokens);
      }
    };

    rehydrate();
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInParams) => {
    const basketSession = await loadBasketSession();
    if (basketSession?.sessionId) {
      setShopperSessionId(basketSession.sessionId);
    }

    const response = await api.auth.login({
      username: email,
      password,
      basketId: basketSession?.basketId ?? undefined,
    });

    if (response.sessionId) {
      setShopperSessionId(response.sessionId);
    }

    if (response.jwtToken) {
      const tokens: AuthTokens = { accessToken: response.jwtToken };
      setAuthTokens(tokens);
      await saveAuthTokens(tokens);
    }

    setUser({ id: response.customerId ?? email, email });

    emitAuthEvent({
      type: "login",
      sessionId: response.sessionId,
      basketId: response.basketId ?? basketSession?.basketId ?? null,
      customerId: response.customerId ?? null,
    });
  }, []);

  const signOut = useCallback(async () => {
    await api.auth.logout();
    await clearAuthTokens();
    setAuthTokens(null);
    setShopperSessionId(null);
    setUser(null);
    emitAuthEvent({ type: "logout" });
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
