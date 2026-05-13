"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getOrder } from "../api/orders.api";
import type { OrderId, OrderResponse } from "../types/orders.types";

interface UseOrderOptions {
  enabled?: boolean;
}

export function useOrder(orderId: OrderId, options: UseOrderOptions = {}) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? Boolean(orderId));

  const query = useQuery<OrderResponse, ApiError>({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled,
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
