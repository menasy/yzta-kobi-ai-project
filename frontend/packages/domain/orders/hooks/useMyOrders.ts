"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getMyOrders } from "../api/orders.api";
import type { OrdersResponse } from "../types/orders.types";

interface UseMyOrdersOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useMyOrders(options: UseMyOrdersOptions = {}) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady ? options.refetchInterval : false;

  const query = useQuery<OrdersResponse, ApiError>({
    queryKey: queryKeys.orders.myList(),
    queryFn: getMyOrders,
    enabled,
    refetchInterval,
  });

  return {
    orders: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
