"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@repo/ui-web";
import { useAuthStore } from "@repo/state/stores/auth/auth.store";
// import { useLogout } from "@repo/domain/auth/hooks/useLogout"; // Varsayılan olarak state temizlemeyi kullanacağız şimdilik

export function GlobalHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  // const { mutate: serverLogout } = useLogout();

  const handleLogout = () => {
    // serverLogout(); // Backend logout çağrısı
    logout(); // Local state temizliği
    window.location.href = "/auth/login";
  };

  return (
    <AppHeader
      isAuthenticated={!!user}
      user={user ? {
        name: user.name,
        email: user.email,
        initials: user.name.slice(0, 2).toUpperCase()
      } : undefined}
      activePathname={pathname}
      onLogout={handleLogout}
    />
  );
}
