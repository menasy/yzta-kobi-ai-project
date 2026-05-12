"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { refreshShipment } from "../api/shipments.api";
import type {
  RefreshShipmentResponse,
  TrackingNumber,
} from "../types/shipments.types";

interface UseRefreshShipmentOptions {
  onSuccess?: (
    data: RefreshShipmentResponse,
    variables: TrackingNumber,
  ) => void;
  onError?: (error: ApiError, variables: TrackingNumber) => void;
  onSettled?: (
    data: RefreshShipmentResponse | undefined,
    error: ApiError | null,
    variables: TrackingNumber,
  ) => void;
}

export function useRefreshShipment(options: UseRefreshShipmentOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    RefreshShipmentResponse,
    ApiError,
    TrackingNumber
  >({
    mutationKey: [...queryKeys.shipments.all, "refresh"] as const,
    mutationFn: refreshShipment,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments.detail(variables),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments.delayed(),
      });
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options.onSettled?.(data, error ?? null, variables);
    },
  });

  return {
    refreshShipment: mutation.mutate,
    refreshShipmentAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
