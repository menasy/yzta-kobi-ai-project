"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOrder } from "../api/orders.api";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from "../types/orders.types";

interface UseCreateOrderOptions {
  onSuccess?: (data: CreateOrderResponse, variables: CreateOrderRequest) => void;
  onError?: (error: ApiError, variables: CreateOrderRequest) => void;
  onSettled?: (
    data: CreateOrderResponse | undefined,
    error: ApiError | null,
    variables: CreateOrderRequest,
  ) => void;
}

export function useCreateOrder(options: UseCreateOrderOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<CreateOrderResponse, ApiError, CreateOrderRequest>(
    {
      mutationKey: [...queryKeys.orders.all, "create"] as const,
      mutationFn: createOrder,
      onSuccess: (data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.orders.myList(),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
    createOrder: mutation.mutate,
    createOrderAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
