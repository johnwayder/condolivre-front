"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { login as apiLogin, AuthUser } from "@/lib/api";
import { clearStoredToken, getStoredToken, storeToken } from "@/lib/apiClient";

const USER_KEY = "condolivre_user";

interface JwtPayload {
  exp?: number;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as JwtPayload;
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isStaff: boolean;
  isClient: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => void;
  applyUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const rawUser =
      typeof window !== "undefined"
        ? window.localStorage.getItem(USER_KEY)
        : null;
    if (token && rawUser && !isTokenExpired(token)) {
      setUser(JSON.parse(rawUser) as AuthUser);
    } else {
      clearStoredToken();
      window.localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    storeToken(result.token.accessToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(() => {
    clearStoredToken();
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const applyUser = useCallback((updated: AuthUser) => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      isOperator: user?.role === "OPERATOR",
      isStaff: user?.role === "ADMIN" || user?.role === "OPERATOR",
      isClient: user?.role === "USER",
      loading,
      signIn,
      signOut,
      applyUser,
    }),
    [user, loading, signIn, signOut, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
