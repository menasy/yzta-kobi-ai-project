"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getLowStockProducts } from "../api/products.api";
import type { LowStockProductsResponse } from "../types/products.types";

interface UseLowStockProductsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useLowStockProducts(
  options: UseLowStockProductsOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady ? options.refetchInterval : false;

  const query = useQuery<LowStockProductsResponse, ApiError>({
    queryKey: queryKeys.products.lowStock(),
    queryFn: getLowStockProducts,
    enabled,
    refetchInterval,
  });

  return {
    products: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
