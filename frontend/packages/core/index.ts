/**
 * @repo/core — Altyapı Katmanı
 *
 * Bu package dışa sıfır iç bağımlılığa sahiptir.
 * Tüm diğer package'lar bu package'ı import edebilir.
 *
 * Export'lar:
 * - apiClient: Temel HTTP istemcisi
 * - ApiError: Standart hata sınıfı
 * - cn: clsx + tailwind-merge helper
 * - format: Para, tarih formatlayıcılar
 * - useDebounce, useIntersectionObserver: Genel hooklar
 */

// Utils
export { cn } from "./utils/cn";
export { formatCurrency, formatDate, formatPhone } from "./utils/format";
export { calculatePagination } from "./utils/pagination";

// Hooks
export { useDebounce } from "./hooks/useDebounce";
export { useIntersectionObserver } from "./hooks/useIntersectionObserver";

// Client
export { apiClient } from "./client/client";
export { ApiError } from "./client/api-error";
export type { ApiResponse, PaginatedData } from "./client/types";
