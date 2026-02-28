"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole, Permission } from "@/lib/auth";

// ============================================================
// 🛡️ ProtectedRoute - Bảo vệ route theo role hoặc permission
// ============================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  permissions,
  redirectTo = "/login",
  fallback,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasPermission, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (roles && roles.length > 0 && !hasRole(...roles)) {
      router.replace("/unauthorized");
      return;
    }

    if (
      permissions &&
      permissions.length > 0 &&
      !hasPermission(...permissions)
    ) {
      router.replace("/unauthorized");
      return;
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-amber-400 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return fallback || null;
  }

  if (permissions && permissions.length > 0 && !hasPermission(...permissions)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// ============================================================
// 👁️ Show/Hide component theo permission (không redirect)
// ============================================================

interface ShowIfProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
}

export function ShowIf({ children, roles, permissions }: ShowIfProps) {
  const { hasPermission, hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;
  if (roles && !hasRole(...roles)) return null;
  if (permissions && !hasPermission(...permissions)) return null;

  return <>{children}</>;
}
