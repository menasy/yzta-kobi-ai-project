"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../api/products.api";
import type {
  ProductListParams,
  ProductsResponse,
} from "../types/products.types";

interface UseProductsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useProducts(
  params?: ProductListParams,
  options: UseProductsOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady ? options.refetchInterval : false;

  const query = useQuery<ProductsResponse, ApiError>({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
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
