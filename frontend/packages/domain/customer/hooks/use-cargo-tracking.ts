"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation } from "@tanstack/react-query";

import { trackCargo } from "../api/customer.api";
import type { CargoTrackingInput } from "../schemas/customer.schema";
import type { CargoTrackingResponse } from "../types/customer.types";

interface UseCargoTrackingOptions {
  onSuccess?: (data: CargoTrackingResponse, variables: CargoTrackingInput) => void;
  onError?: (error: ApiError, variables: CargoTrackingInput) => void;
}

export function useCargoTracking(options: UseCargoTrackingOptions = {}) {
  const mutation = useMutation<CargoTrackingResponse, ApiError, CargoTrackingInput>({
    mutationKey: queryKeys.customer.cargoTracking(),
    mutationFn: trackCargo,
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
  });

  return {
    trackCargo: mutation.mutate,
    trackCargoAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
