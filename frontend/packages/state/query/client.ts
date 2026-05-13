import { QueryClient } from "@tanstack/react-query";

export const STALE_TIME = 10 * 60 * 1000;
export const GC_TIME = 15 * 60 * 1000;
export const RETRY_COUNT = 2;
export const RETRY_BASE_DELAY = 1000;
export const RETRY_MAX_DELAY = 30_000;

interface StatusCodeError {
  statusCode: number;
}

interface ErrorKey {
  key: string;
}

function hasStatusCode(error: unknown): error is StatusCodeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  );
}

function hasErrorKey(error: unknown): error is ErrorKey {
  return (
    typeof error === "object" &&
    error !== null &&
    "key" in error &&
    typeof error.key === "string"
  );
}

export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= RETRY_COUNT) {
    return false;
  }

  if (hasErrorKey(error)) {
    const nonRetryKeys = new Set([
      "DATABASE_NOT_READY",
      "MIGRATION_REQUIRED",
      "SEED_REQUIRED",
      "INVALID_RESPONSE",
    ]);
    if (nonRetryKeys.has(error.key)) {
      return false;
    }
  }

  if (hasStatusCode(error)) {
    return error.statusCode < 400 || error.statusCode >= 500;
  }

  return true;
}

export function exponentialBackoff(attempt: number): number {
  return Math.min(RETRY_BASE_DELAY * 2 ** attempt, RETRY_MAX_DELAY);
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: shouldRetryQuery,
        retryDelay: exponentialBackoff,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        throwOnError: false,
      },
      mutations: {
        retry: false,
        throwOnError: false,
      },
    },
  });
}
