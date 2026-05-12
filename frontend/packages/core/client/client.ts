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

export function resolveApiBaseUrl(baseUrl: string): string {
  if (/^https?:\/\//.test(baseUrl)) {
    return baseUrl;
  }

  const normalizedRootUrl = BASE_URL.replace(/\/$/, "");
  const normalizedBasePath = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;

  return `${normalizedRootUrl}${normalizedBasePath}`;
}

export function buildApiUrl(
  baseUrl: string,
  path: string,
  params?: ApiRequestConfig["params"],
): string {
  const normalizedBaseUrl = resolveApiBaseUrl(baseUrl).replace(/\/$/, "");
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
    const json = JSON.parse(text) as Partial<ApiResponse<T>> & {
      detail?: unknown;
    };

    if (typeof json.statusCode !== "number") {
      const detail =
        typeof json.detail === "string"
          ? json.detail
          : response.statusText || "Bir hata oluştu";

      return {
        statusCode: response.status,
        key: response.ok ? "SUCCESS" : "UNKNOWN_ERROR",
        message: detail === "Not Found" ? "Endpoint bulunamadı." : detail,
        data: null as T,
        errors: null,
      };
    }

    return json as ApiResponse<T>;
  } catch {
    throw new ApiError("Geçersiz API yanıtı", "INVALID_RESPONSE", response.status);
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public async request<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    const { params, ...requestInit } = init ?? {};
    const response = await fetch(buildApiUrl(this.baseUrl, path, params), {
      cache: "no-store",
      ...requestInit,
      headers: buildHeaders(requestInit),
      credentials: "include",
    });

    const json = await parseResponse<TData>(response);

    if (!response.ok || json.statusCode >= 400) {
      throw new ApiError(
        json.message ?? "Bir hata oluştu",
        json.key ?? "UNKNOWN_ERROR",
        json.statusCode || response.status,
        json.errors ?? null,
      );
    }

    return json;
  }

  public async requestData<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    const response = await this.request<TData>(path, init);
    return response.data;
  }

  public get<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>(path, { ...init, method: "GET" });
  }

  public post<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>(path, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>(path, {
      ...init,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>(path, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<ApiResponse<TData>> {
    return this.request<TData>(path, { ...init, method: "DELETE" });
  }

  public getData<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    return this.requestData<TData>(path, { ...init, method: "GET" });
  }

  public async postData<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    const response = await this.post<TData, TRequest>(path, body, init);
    return response.data;
  }

  public async putData<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    const response = await this.put<TData, TRequest>(path, body, init);
    return response.data;
  }

  public async patchData<TData, TRequest = unknown>(
    path: string,
    body?: TRequest,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    const response = await this.patch<TData, TRequest>(path, body, init);
    return response.data;
  }

  public async deleteData<TData>(
    path: string,
    init?: ApiRequestConfig,
  ): Promise<TData> {
    const response = await this.delete<TData>(path, init);
    return response.data;
  }
}

const defaultClient = new ApiClient();

export async function apiClient<T>(
  path: string,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.request<T>(path, init);
}

export async function apiDataClient<T>(
  path: string,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.requestData<T>(path, init);
}

/**
 * GET isteği
 */
export function get<T>(
  path: string,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.get<T>(path, init);
}

export function getData<T>(path: string, init?: ApiRequestConfig): Promise<T> {
  return defaultClient.getData<T>(path, init);
}

/**
 * POST isteği
 */
export function post<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.post<T, TRequest>(path, body, init);
}

export function postData<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.postData<T, TRequest>(path, body, init);
}

/**
 * PUT isteği
 */
export function put<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.put<T, TRequest>(path, body, init);
}

export function putData<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.putData<T, TRequest>(path, body, init);
}

/**
 * PATCH isteği
 */
export function patch<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.patch<T, TRequest>(path, body, init);
}

export function patchData<T, TRequest = unknown>(
  path: string,
  body?: TRequest,
  init?: ApiRequestConfig,
): Promise<T> {
  return defaultClient.patchData<T, TRequest>(path, body, init);
}

/**
 * DELETE isteği
 */
export function del<T>(
  path: string,
  init?: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  return defaultClient.delete<T>(path, init);
}

export function delData<T>(path: string, init?: ApiRequestConfig): Promise<T> {
  return defaultClient.deleteData<T>(path, init);
}
