"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOrderStatus } from "../api/orders.api";
import type {
  OrderId,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from "../types/orders.types";

interface UpdateOrderStatusVariables {
  orderId: OrderId;
  data: UpdateOrderStatusRequest;
}

interface UseUpdateOrderStatusOptions {
  onSuccess?: (
    data: UpdateOrderStatusResponse,
    variables: UpdateOrderStatusVariables,
  ) => void;
  onError?: (error: ApiError, variables: UpdateOrderStatusVariables) => void;
  onSettled?: (
    data: UpdateOrderStatusResponse | undefined,
    error: ApiError | null,
    variables: UpdateOrderStatusVariables,
  ) => void;
}

export function useUpdateOrderStatus(
  options: UseUpdateOrderStatusOptions = {},
) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    UpdateOrderStatusResponse,
    ApiError,
    UpdateOrderStatusVariables
  >({
    mutationKey: [...queryKeys.orders.all, "updateStatus"] as const,
    mutationFn: ({ orderId, data }) => updateOrderStatus(orderId, data),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(variables.orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.myDetail(variables.orderId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.summaryToday(),
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
    updateOrderStatus: mutation.mutate,
    updateOrderStatusAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
