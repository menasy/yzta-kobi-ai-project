"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation } from "@tanstack/react-query";

import { queryStock } from "../api/customer.api";
import type { StockQueryInput } from "../schemas/customer.schema";
import type { StockQueryResponse } from "../types/customer.types";

interface UseStockQueryOptions {
  onSuccess?: (data: StockQueryResponse, variables: StockQueryInput) => void;
  onError?: (error: ApiError, variables: StockQueryInput) => void;
}

export function useStockQuery(options: UseStockQueryOptions = {}) {
  const mutation = useMutation<StockQueryResponse, ApiError, StockQueryInput>({
    mutationKey: queryKeys.customer.stockQuery(),
    mutationFn: queryStock,
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
  });

  return {
    queryStock: mutation.mutate,
    queryStockAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
