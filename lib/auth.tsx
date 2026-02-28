"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "./axios";

export type UserRole =
  | "SUPER_ADMIN"
  | "XU_DOAN_TRUONG"
  | "XU_DOAN_PHO"
  | "TRUONG_TRUC"
  | "TRUONG_LOP";

export type Permission =
  | "students:read"
  | "students:write"
  | "students:delete"
  | "checkins:read"
  | "checkins:write"
  | "activities:read"
  | "activities:write"
  | "activities:delete"
  | "leaderboard:read"
  | "ranking:read"
  | "statistics:read"
  | "statistics:advanced"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "users:grant_role"
  | "classes:read"
  | "classes:read_own"
  | "reports:read"
  | "reports:export";

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  class_name?: string;
  permissions: Permission[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (...perms: Permission[]) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session từ localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("auth_user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData, permissions } = res.data;

    const authUser: AuthUser = {
      ...userData,
      permissions: permissions || [],
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(authUser));

    setToken(newToken);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  const hasPermission = (...perms: Permission[]) => {
    if (!user) return false;
    return perms.some((p) => user.permissions.includes(p));
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
