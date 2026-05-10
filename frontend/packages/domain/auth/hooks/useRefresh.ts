"use client";

import type { ApiError } from "@repo/core";
import { useMutation } from "@tanstack/react-query";

import { queryKeys } from "../../../state/query/keys";
import { refresh } from "../api/auth.api";
import type { RefreshResponse } from "../types/auth.types";

interface UseRefreshOptions {
  onSuccess?: (data: RefreshResponse) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: RefreshResponse | undefined, error: ApiError | null) => void;
}

export function useRefresh(options: UseRefreshOptions = {}) {
  const mutation = useMutation<RefreshResponse, ApiError, void>({
    mutationKey: [...queryKeys.auth.all, "refresh"] as const,
    mutationFn: refresh,
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
    onSettled: (data, error) => {
      options.onSettled?.(data, error ?? null);
    },
  });

  return {
    refresh: mutation.mutate,
    refreshAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
