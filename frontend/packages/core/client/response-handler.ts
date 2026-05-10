import { ApiError } from "./api-error";
import type { ApiResponse } from "./types";

/**
 * Response handler — Backend ApiResponse<T> formatını doğrular.
 */
export function handleResponse<T>(json: ApiResponse<T>): ApiResponse<T> {
  if (json.statusCode >= 400) {
    throw new ApiError(
      json.message ?? "Bir hata oluştu",
      json.key ?? "UNKNOWN_ERROR",
      json.statusCode,
      json.errors ?? null,
    );
  }
  return json;
}

export function unwrapResponseData<T>(json: ApiResponse<T>): T {
  return handleResponse(json).data;
}
