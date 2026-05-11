"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getMyOrder } from "../api/orders.api";
import type { OrderId, OrderResponse } from "../types/orders.types";

interface UseMyOrderOptions {
  enabled?: boolean;
}

export function useMyOrder(orderId: OrderId, options: UseMyOrderOptions = {}) {
  const query = useQuery<OrderResponse, ApiError>({
    queryKey: queryKeys.orders.myDetail(orderId),
    queryFn: () => getMyOrder(orderId),
    enabled: options.enabled ?? Boolean(orderId),
  });

  return {
    order: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
