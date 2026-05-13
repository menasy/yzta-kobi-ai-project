"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getShipment } from "../api/shipments.api";
import type {
  ShipmentResponse,
  TrackingNumber,
} from "../types/shipments.types";

interface UseShipmentOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useShipment(
  trackingNumber: TrackingNumber,
  options: UseShipmentOptions = {},
) {
  const query = useQuery<ShipmentResponse, ApiError>({
    queryKey: queryKeys.shipments.detail(trackingNumber),
    queryFn: () => getShipment(trackingNumber),
    enabled: options.enabled ?? Boolean(trackingNumber),
    refetchInterval: options.refetchInterval,
  });

  return {
    shipment: query.data?.data ?? null,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
