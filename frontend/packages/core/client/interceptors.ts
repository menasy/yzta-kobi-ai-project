/**
 * Request/Response interceptor'ları
 *
 * 401 Unauthorized → /auth/login'e yönlendir
 * Bu modül yalnızca Client Component bağlamında kullanılır (window erişimi için).
 */

import { ApiError } from "./api-error";

/**
 * 401 hatasını yakala ve login sayfasına yönlendir.
 * Bu fonksiyon TanStack Query'nin onError callback'lerinde kullanılır.
 */
export function handleUnauthorized(error: unknown): void {
  if (error instanceof ApiError && error.isUnauthorized) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }
}

/**
 * Hata tipini güvenli şekilde ApiError'a dönüştür
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) {
    return new ApiError(error.message, "UNKNOWN_ERROR", 500);
  }
  return new ApiError("Bilinmeyen bir hata oluştu", "UNKNOWN_ERROR", 500);
}
