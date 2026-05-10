import { ApiError } from "./api-error";
import type { ApiResponse } from "./types";

/**
 * Temel HTTP istemcisi
 *
 * Kurallar:
 * - credentials: "include" — HttpOnly cookie aktarımı için zorunlu
 * - Authorization header eklenmez — tarayıcı cookie'yi otomatik gönderir
 * - 401 → ApiError fırlatır, interceptors.ts yakalar
 * - Backend { statusCode, key, message, data, errors } formatını parse eder
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    credentials: "include", // HttpOnly cookie aktarımı için kritik
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    ...init,
  });

  // Response'u parse et
  const json = (await response.json()) as ApiResponse<T>;

  // Backend standart hata formatını işle
  if (!response.ok) {
    throw new ApiError(
      json.message ?? "Bir hata oluştu",
      json.key ?? "UNKNOWN_ERROR",
      response.status,
      json.errors,
    );
  }

  return json.data;
}

/**
 * GET isteği
 */
export function get<T>(path: string, init?: RequestInit): Promise<T> {
  return apiClient<T>(path, { method: "GET", ...init });
}

/**
 * POST isteği
 */
export function post<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  return apiClient<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

/**
 * PUT isteği
 */
export function put<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  return apiClient<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

/**
 * PATCH isteği
 */
export function patch<T>(
  path: string,
  body?: unknown,
  init?: RequestInit,
): Promise<T> {
  return apiClient<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
}

/**
 * DELETE isteği
 */
export function del<T>(path: string, init?: RequestInit): Promise<T> {
  return apiClient<T>(path, { method: "DELETE", ...init });
}
