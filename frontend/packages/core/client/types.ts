/**
 * Ortak API tip tanımları
 *
 * Backend standart response formatı:
 * { statusCode, key, message, data, errors }
 */

export type ApiResponseErrors =
  | Record<string, string[]>
  | Array<{ field?: string; message?: string; [key: string]: unknown }>
  | null;

export interface ApiResponse<T = unknown> {
  statusCode: number;
  key: string;
  message: string;
  data: T;
  errors?: ApiResponseErrors;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}
