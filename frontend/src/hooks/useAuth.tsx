import { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AUTH_TOKEN_KEY } from "../features/auth";

const AUTH_EXPIRY_KEY = "auth_expiry";
const SESSION_DURATION_HOURS = 12;

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper to check if session is expired
function isSessionExpired(): boolean {
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (!expiry) return true;
  return new Date().getTime() > parseInt(expiry, 10);
}

// Helper to set session expiry (12 hours from now)
function setSessionExpiry(): void {
  const expiryTime = new Date().getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000;
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
}

// Helper to clear session
function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    // Check if session expired on initial load
    if (storedToken && isSessionExpired()) {
      clearSession();
      return null;
    }
    return storedToken;
  });

  // Check session expiry periodically
  useEffect(() => {
    const checkExpiry = () => {
      if (token && isSessionExpired()) {
        clearSession();
        setToken(null);
        window.location.href = "/login"; // Redirect to login
      }
    };

    // Check every minute
    const interval = setInterval(checkExpiry, 60000);
    
    // Also check on window focus
    const handleFocus = () => checkExpiry();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token) && !isSessionExpired(),
      login: (newToken: string) => {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        setSessionExpiry(); // Set 12-hour expiry
        setToken(newToken);
      },
      logout: () => {
        clearSession();
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
