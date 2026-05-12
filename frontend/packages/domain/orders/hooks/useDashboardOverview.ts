"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "../api/orders.api";
import type { DashboardOverviewResponse } from "../types/orders.types";

interface UseDashboardOverviewOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useDashboardOverview(
  options: UseDashboardOverviewOptions = {},
) {
  const query = useQuery<DashboardOverviewResponse, ApiError>({
    queryKey: queryKeys.orders.dashboardOverview(),
    queryFn: getDashboardOverview,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval ?? 30_000,
  });

  return {
    overview: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
