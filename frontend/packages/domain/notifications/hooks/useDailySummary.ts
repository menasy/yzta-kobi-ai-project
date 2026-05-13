"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getNotificationDailySummary } from "../api/notifications.api";
import type { DailySummaryResponse } from "../types/notifications.types";

interface UseNotificationDailySummaryOptions {
  enabled?: boolean;
}

export function useNotificationDailySummary(
  options: UseNotificationDailySummaryOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);

  const query = useQuery<DailySummaryResponse, ApiError>({
    queryKey: queryKeys.notifications.dailySummary(),
    queryFn: getNotificationDailySummary,
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    summary: query.data?.data?.summary ?? null,
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  } as const;
}
