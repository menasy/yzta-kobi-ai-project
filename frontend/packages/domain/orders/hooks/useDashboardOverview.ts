"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
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
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady
    ? options.refetchInterval ?? 30_000
    : false;

  const query = useQuery<DashboardOverviewResponse, ApiError>({
    queryKey: queryKeys.orders.dashboardOverview(),
    queryFn: getDashboardOverview,
    enabled,
    refetchInterval,
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
