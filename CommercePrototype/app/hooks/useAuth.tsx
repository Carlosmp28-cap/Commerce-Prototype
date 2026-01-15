import { useCallback, useState, createContext, useContext } from "react";

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
};

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TODO: wire real state and rehydrate on startup.
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback(async ({ email }: SignInParams) => {
    // Prototype behavior: create a local user object.
    // Replace with real auth service + token persistence later.
    setUser({ id: "user-demo", email });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
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
