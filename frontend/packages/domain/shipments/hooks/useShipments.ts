"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getShipments } from "../api/shipments.api";
import type {
  ShipmentListParams,
  ShipmentsResponse,
} from "../types/shipments.types";

interface UseShipmentsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useShipments(
  params?: ShipmentListParams,
  options: UseShipmentsOptions = {},
) {
  const query = useQuery<ShipmentsResponse, ApiError>({
    queryKey: queryKeys.shipments.list(params),
    queryFn: () => getShipments(params),
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    shipments: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
