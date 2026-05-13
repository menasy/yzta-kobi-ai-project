"use client";

import {
  getDefaultPathForRole,
  getPrimaryNavigationItems,
  useLogout,
} from "@repo/domain/auth";
import { useUnreadNotifications } from "@repo/domain/notifications";
import {
  useAuthActions,
  useIsAuthenticated,
  useIsSessionLoading,
  useUser,
} from "@repo/state/stores/auth";
import { AppHeader } from "@repo/ui-web";
import { usePathname } from "next/navigation";

export function GlobalHeader() {
  const pathname = usePathname();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isSessionLoading = useIsSessionLoading();
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
  const userRole = user?.role ?? null;
  const navItems = isSessionLoading
    ? []
    : getPrimaryNavigationItems({
        isAuthenticated,
        role: userRole,
      });
  const logoHref = isAuthenticated
    ? getDefaultPathForRole(userRole)
    : "/";

  const { unreadCount } = useUnreadNotifications({
    enabled: isAuthenticated,
  });

  return (
    <AppHeader
      isAuthenticated={isAuthenticated}
      navItems={navItems}
      logoHref={logoHref}
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
      unreadNotificationCount={unreadCount}
    />
  );
}
