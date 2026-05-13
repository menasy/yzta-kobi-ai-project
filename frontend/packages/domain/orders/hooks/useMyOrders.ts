"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getMyOrders } from "../api/orders.api";
import type { OrdersResponse } from "../types/orders.types";

interface UseMyOrdersOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useMyOrders(options: UseMyOrdersOptions = {}) {
  const query = useQuery<OrdersResponse, ApiError>({
    queryKey: queryKeys.orders.myList(),
    queryFn: getMyOrders,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
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
