"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createShipment } from "../api/shipments.api";
import type {
  CreateShipmentRequest,
  CreateShipmentResponse,
} from "../types/shipments.types";

interface UseCreateShipmentOptions {
  onSuccess?: (
    data: CreateShipmentResponse,
    variables: CreateShipmentRequest,
  ) => void;
  onError?: (error: ApiError, variables: CreateShipmentRequest) => void;
  onSettled?: (
    data: CreateShipmentResponse | undefined,
    error: ApiError | null,
    variables: CreateShipmentRequest,
  ) => void;
}

export function useCreateShipment(options: UseCreateShipmentOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    CreateShipmentResponse,
    ApiError,
    CreateShipmentRequest
  >({
    mutationKey: [...queryKeys.shipments.all, "create"] as const,
    mutationFn: createShipment,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
      if (data.data?.tracking_number) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.shipments.detail(data.data.tracking_number),
        });
      }
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
    createShipment: mutation.mutate,
    createShipmentAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
