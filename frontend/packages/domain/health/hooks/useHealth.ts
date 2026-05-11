"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../api/health.api";
import type { HealthResponse } from "../types/health.types";

interface UseHealthOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useHealth(options: UseHealthOptions = {}) {
  const query = useQuery<HealthResponse, ApiError>({
    queryKey: queryKeys.health.status(),
    queryFn: getHealth,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    health: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
