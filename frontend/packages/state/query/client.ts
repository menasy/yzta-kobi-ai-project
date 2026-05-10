import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack QueryClient instance
 *
 * Ayarlar:
 * - staleTime: 60sn — API'ye gereksiz istek atılmaz
 * - gcTime: 5dk — cache hafızada tutulur
 * - retry: 1 — sadece bir kez yeniden dener
 * - refetchOnWindowFocus: false — sekme değişiminde refetch yok
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1_000,          // 60 saniye
      gcTime: 5 * 60 * 1_000,         // 5 dakika
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
