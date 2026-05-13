"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getDelayedShipments } from "../api/shipments.api";
import type {
  DelayedShipmentsResponse,
  ShipmentListParams,
} from "../types/shipments.types";

type DelayedShipmentParams = Pick<ShipmentListParams, "skip" | "limit">;

interface UseDelayedShipmentsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useDelayedShipments(
  params?: DelayedShipmentParams,
  options: UseDelayedShipmentsOptions = {},
) {
  const query = useQuery<DelayedShipmentsResponse, ApiError>({
    queryKey: queryKeys.shipments.delayed(params),
    queryFn: () => getDelayedShipments(params),
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
