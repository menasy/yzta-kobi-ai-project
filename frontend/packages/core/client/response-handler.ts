import { ApiError } from "./api-error";
import type { ApiResponse } from "./types";

/**
 * Response handler — Backend ApiResponse<T> formatını parse eder
 */
export function handleResponse<T>(json: ApiResponse<T>): T {
  if (json.statusCode >= 400) {
    throw new ApiError(
      json.message ?? "Bir hata oluştu",
      json.key ?? "UNKNOWN_ERROR",
      json.statusCode,
      json.errors,
    );
  }
  return json.data;
}
