import type { UseQueryOptions } from "@tanstack/react-query";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface InfiniteQueryParams extends QueryParams {
  cursor?: string | null;
  limit?: number;
}

export type BaseQueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError, TData>,
  "queryKey" | "queryFn"
>;

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}

export interface MutationCallbacks<TData, TError = Error> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | null) => void;
}
