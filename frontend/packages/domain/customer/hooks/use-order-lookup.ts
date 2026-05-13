"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation } from "@tanstack/react-query";

import { lookupOrder } from "../api/customer.api";
import type { OrderLookupInput } from "../schemas/customer.schema";
import type { OrderLookupResponse } from "../types/customer.types";

interface UseOrderLookupOptions {
  onSuccess?: (data: OrderLookupResponse, variables: OrderLookupInput) => void;
  onError?: (error: ApiError, variables: OrderLookupInput) => void;
}

export function useOrderLookup(options: UseOrderLookupOptions = {}) {
  const mutation = useMutation<OrderLookupResponse, ApiError, OrderLookupInput>({
    mutationKey: queryKeys.customer.orderLookup(),
    mutationFn: lookupOrder,
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
  });

  return {
    lookupOrder: mutation.mutate,
    lookupOrderAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
