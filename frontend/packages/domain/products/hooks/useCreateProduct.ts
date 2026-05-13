"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createProduct } from "../api/products.api";
import type {
  CreateProductResponse,
  ProductCreateRequest,
} from "../types/products.types";

interface UseCreateProductOptions {
  onSuccess?: (
    data: CreateProductResponse,
    variables: ProductCreateRequest,
  ) => void;
  onError?: (error: ApiError, variables: ProductCreateRequest) => void;
  onSettled?: (
    data: CreateProductResponse | undefined,
    error: ApiError | null,
    variables: ProductCreateRequest,
  ) => void;
}

export function useCreateProduct(options: UseCreateProductOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    CreateProductResponse,
    ApiError,
    ProductCreateRequest
  >({
    mutationKey: [...queryKeys.products.all, "create"] as const,
    mutationFn: createProduct,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
    createProduct: mutation.mutate,
    createProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
