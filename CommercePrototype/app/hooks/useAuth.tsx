import { createContext, useContext } from "react";

/**
 * Auth state (prototype).
 *
 * Centralizes authentication state so screens/components can reliably check
 * current user and perform sign-in/sign-out.
 *
 * TODO: implement using an auth service and persist tokens via storage.
 */

// Minimal placeholder context.
// The full auth/login implementation lives on another branch.
const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  return (
    <AuthContext.Provider
      value={{ user: null, signIn: () => {}, signOut: () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
