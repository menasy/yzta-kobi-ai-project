import { apiClient } from "@repo/core/client";

/**
 * Ortak API İstemcisi
 *
 * Hem RSC hem de CSR tarafından kullanılır.
 * Base URL ortama göre yapılandırılır:
 * - NEXT_PUBLIC_API_BASE_URL env değişkeninden alınır
 * - Default: http://localhost:8000
 *
 * Tüm istekler /api prefix'i üzerinden gider.
 */
export { apiClient };

/**
 * API path prefix yardımcısı
 * @example api("/auth/login") → "/api/auth/login"
 */
export function api(path: string): string {
  return `/api${path}`;
}
