import { useState, useEffect, createContext, useContext } from "react";

// Hook + Context: useAuth() exposing user, signIn, signOut, isAuthenticated.
// TODO: implement using auth service and persist tokens via storage.ts.

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  // TODO: wire real state and rehydrate on startup
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
