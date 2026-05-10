"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateStock } from "../api/inventory.api";
import type {
  UpdateStockRequest,
  UpdateStockResponse,
} from "../types/inventory.types";

interface UseUpdateStockOptions {
  onSuccess?: (data: UpdateStockResponse, variables: UpdateStockRequest) => void;
  onError?: (error: ApiError, variables: UpdateStockRequest) => void;
  onSettled?: (
    data: UpdateStockResponse | undefined,
    error: ApiError | null,
    variables: UpdateStockRequest,
  ) => void;
}

export function useUpdateStock(options: UseUpdateStockOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<UpdateStockResponse, ApiError, UpdateStockRequest>(
    {
      mutationKey: [...queryKeys.inventory.all, "updateStock"] as const,
      mutationFn: updateStock,
      onSuccess: (data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.inventory.all,
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.products.all,
        });
        options.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        options.onError?.(error, variables);
      },
      onSettled: (data, error, variables) => {
        options.onSettled?.(data, error ?? null, variables);
      },
    },
  );

  return {
    updateStock: mutation.mutate,
    updateStockAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
