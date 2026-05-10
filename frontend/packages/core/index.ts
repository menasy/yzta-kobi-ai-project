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
export { formatCurrency, formatDate, formatDateShort, formatRelativeTime, formatPhone, formatNumber } from "./utils/format";
export { calculatePagination, getPageRange } from "./utils/pagination";

// Hooks
export { useDebounce } from "./hooks/useDebounce";
export { useIntersectionObserver } from "./hooks/useIntersectionObserver";

// Client
export { apiClient, get, post, put, patch, del } from "./client/client";
export { ApiError } from "./client/api-error";
export { handleResponse } from "./client/response-handler";
export { handleUnauthorized, toApiError } from "./client/interceptors";
export type { ApiResponse, PaginatedData, ApiRequestConfig } from "./client/types";
