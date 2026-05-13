"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getDailySummary } from "../api/orders.api";
import type { DailyOrderSummaryResponse } from "../types/orders.types";

interface UseDailySummaryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useDailySummary(options: UseDailySummaryOptions = {}) {
  const query = useQuery<DailyOrderSummaryResponse, ApiError>({
    queryKey: queryKeys.orders.summaryToday(),
    queryFn: getDailySummary,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval ?? 30_000,
  });

  return {
    summary: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
