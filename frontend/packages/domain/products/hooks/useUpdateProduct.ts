"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProduct } from "../api/products.api";
import type {
  ProductId,
  ProductUpdateRequest,
  UpdateProductResponse,
} from "../types/products.types";

interface UpdateProductVariables {
  id: ProductId;
  data: ProductUpdateRequest;
}

interface UseUpdateProductOptions {
  onSuccess?: (
    data: UpdateProductResponse,
    variables: UpdateProductVariables,
  ) => void;
  onError?: (error: ApiError, variables: UpdateProductVariables) => void;
  onSettled?: (
    data: UpdateProductResponse | undefined,
    error: ApiError | null,
    variables: UpdateProductVariables,
  ) => void;
}

export function useUpdateProduct(options: UseUpdateProductOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    UpdateProductResponse,
    ApiError,
    UpdateProductVariables
  >({
    mutationKey: [...queryKeys.products.all, "update"] as const,
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.id),
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
    updateProduct: mutation.mutate,
    updateProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
