import { useState, useEffect, createContext, useContext } from "react";

/**
 * Auth state (prototype).
 *
 * Centralizes authentication state so screens/components can reliably check
 * current user and perform sign-in/sign-out.
 *
 * TODO: implement using an auth service and persist tokens via storage.
 */

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  // TODO: wire real state and rehydrate on startup.
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, signIn: () => {}, signOut: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
