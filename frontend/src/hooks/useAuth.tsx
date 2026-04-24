import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AUTH_TOKEN_KEY } from "../features/auth";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (newToken: string) => {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        setToken(newToken);
      },
      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
      }
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
