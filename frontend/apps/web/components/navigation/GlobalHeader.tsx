"use client";

import { useLogout } from "@repo/domain/auth";
import {
  useAuthActions,
  useIsAuthenticated,
  useUser,
} from "@repo/state/stores/auth";
import { AppHeader } from "@repo/ui-web";
import { usePathname } from "next/navigation";

export function GlobalHeader() {
  const pathname = usePathname();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const { clearAuth } = useAuthActions();
  const { logout } = useLogout({
    onSuccess: () => {
      clearAuth();
      window.location.href = "/auth/login";
    },
  });

  const handleLogout = () => {
    logout();
  };

  const displayName = user?.full_name?.trim() || user?.email || "";

  return (
    <AppHeader
      isAuthenticated={isAuthenticated}
      user={
        user
          ? {
              name: displayName,
              email: user.email,
              initials: displayName.slice(0, 2).toUpperCase(),
            }
          : undefined
      }
      activePathname={pathname}
      onLogout={handleLogout}
    />
  );
}
