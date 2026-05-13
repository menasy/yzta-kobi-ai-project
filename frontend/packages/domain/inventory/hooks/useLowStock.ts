"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getLowStock } from "../api/inventory.api";
import type { LowStockResponse } from "../types/inventory.types";

interface UseLowStockOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useLowStock(options: UseLowStockOptions = {}) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady
    ? options.refetchInterval ?? 60_000
    : false;

  const query = useQuery<LowStockResponse, ApiError>({
    queryKey: queryKeys.inventory.lowStock(),
    queryFn: getLowStock,
    enabled,
    refetchInterval,
  });

  return {
    alerts: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
