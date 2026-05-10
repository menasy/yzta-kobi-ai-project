"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMe } from "../api/auth.api";
import type { MeResponse } from "../types/auth.types";

interface UseMeOptions {
  enabled?: boolean;
  onSuccess?: (data: MeResponse) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: MeResponse | undefined, error: ApiError | null) => void;
}

export function useMe(options: UseMeOptions = {}) {
  const { enabled, onError, onSettled, onSuccess } = options;
  const queryClient = useQueryClient();
  const query = useQuery<MeResponse, ApiError>({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled,
  });

  useEffect(() => {
    if (query.isSuccess) {
      onSuccess?.(query.data);
      onSettled?.(query.data, null);
    }
  }, [onSettled, onSuccess, query.data, query.isSuccess]);

  useEffect(() => {
    if (query.error) {
      onError?.(query.error);
      onSettled?.(undefined, query.error);
    }
  }, [onError, onSettled, query.error]);

  return {
    user: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
    reset: () => queryClient.resetQueries({ queryKey: queryKeys.auth.me() }),
  } as const;
}
