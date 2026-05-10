/**
 * @repo/state — Global State Yönetimi
 *
 * TanStack Query (server state) ve Zustand (client state) konfigürasyonları.
 * Kural: Server state → TanStack Query | UI state → Zustand
 * Token asla store'da tutulmaz — auth HttpOnly cookie üzerinden yürür.
 */

// TanStack Query
export { queryClient } from "./query/client";
export { QueryProvider } from "./query/provider";
export { queryKeys } from "./query/keys";
export type { QueryKeys } from "./query/types";

// Zustand Stores
export { useAuthStore } from "./stores/auth/auth.store";
export { useChatStore } from "./stores/chat/chat.store";
export { useUIStore } from "./stores/ui/ui.store";
export { useThemeStore } from "./stores/theme/theme.store";
