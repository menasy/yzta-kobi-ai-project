"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./client";

/**
 * QueryProvider — TanStack Query client provider'ı
 *
 * apps/web/components/providers/index.tsx içinde kullanılır.
 * "use client" zorunludur — QueryClientProvider CSR gerektirir.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
