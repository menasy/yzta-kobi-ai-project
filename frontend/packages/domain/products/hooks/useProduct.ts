"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getProduct } from "../api/products.api";
import type { ProductResponse } from "../api/products.api";

export function useProduct(id: string | number) {
  const systemReady = useSystemReady();
  const query = useQuery<ProductResponse, ApiError>({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: systemReady && !!id,
  });

  return {
    product: query.data?.data,
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
    refetch: query.refetch,
  } as const;
}
