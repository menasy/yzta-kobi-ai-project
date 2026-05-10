import { ApiError } from "./api-error";
import type { ApiRequestConfig, ApiResponse } from "./types";

/**
 * Temel HTTP istemcisi
 *
 * Kurallar:
 * - credentials: "include" — HttpOnly cookie aktarımı için zorunlu
 * - Authorization header eklenmez — tarayıcı cookie'yi otomatik gönderir
 * - 401 → ApiError fırlatır, interceptors.ts yakalar
 * - Backend { statusCode, key, message, data, errors } formatını parse eder
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function resolveBaseUrl(baseUrl: string): string {
  if (/^https?:\/\//.test(baseUrl)) {
    return baseUrl;
  }

  const normalizedRootUrl = BASE_URL.replace(/\/$/, "");
  const normalizedBasePath = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;

  return `${normalizedRootUrl}${normalizedBasePath}`;
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: ApiRequestConfig["params"],
): string {
  const normalizedBaseUrl = resolveBaseUrl(baseUrl).replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function buildHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.delete("Authorization");
  headers.delete("authorization");

  return headers;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    return {
      statusCode: response.status,
      key: response.ok ? "SUCCESS" : "UNKNOWN_ERROR",
      message: response.statusText,
      data: null as T,
      errors: null,
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError("Geçersiz API yanıtı", "INVALID_RESPONSE", response.status);
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public async request<TResponse>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    const { params, ...requestInit } = init ?? {};
    const response = await fetch(buildUrl(this.baseUrl, path, params), {
      ...requestInit,
      headers: buildHeaders(requestInit),
      credentials: "include",
    });

    const json = await parseResponse<TResponse>(response);

    if (!response.ok || json.statusCode >= 400) {
      throw new ApiError(
        json.message ?? "Bir hata oluştu",
        json.key ?? "UNKNOWN_ERROR",
        json.statusCode || response.status,
        json.errors ?? null,
      );
    }

    return json.data;
  }

  public get<TResponse>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, { ...init, method: "GET" });
  }

  public post<TResponse, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<TResponse, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...init,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<TResponse, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<TResponse>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, { ...init, method: "DELETE" });
  }
}

const defaultClient = new ApiClient();

export async function apiClient<T>(
  path: string,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.request<T>(path, init);
}

/**
 * GET isteği
 */
export function get<T>(path: string, init?: ApiRequestConfig): Promise<T> {
  return defaultClient.get<T>(path, init);
}

/**
 * POST isteği
 */
export function post<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.post<T, TRequest>(path, body, init);
}

/**
 * PUT isteği
 */
export function put<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.put<T, TRequest>(path, body, init);
}

/**
 * PATCH isteği
 */
export function patch<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.patch<T, TRequest>(path, body, init);
}

/**
 * DELETE isteği
 */
export function del<T>(path: string, init?: ApiRequestConfig): Promise<T> {
  return defaultClient.delete<T>(path, init);
}
