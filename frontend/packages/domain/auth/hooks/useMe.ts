"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getMe } from "../api/auth.api";
import type { MeResponse } from "../types/auth.types";

interface UseMeOptions {
  enabled?: boolean;
}

export function useMe(options: UseMeOptions = {}) {
  const { enabled } = options;
  const systemReady = useSystemReady();
  const isEnabled = systemReady && (enabled ?? true);
  const queryClient = useQueryClient();
  const query = useQuery<MeResponse, ApiError>({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: isEnabled,
  });

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
