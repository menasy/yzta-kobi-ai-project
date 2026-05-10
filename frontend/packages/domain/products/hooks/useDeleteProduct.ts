"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProduct } from "../api/products.api";
import type {
  DeleteProductResponse,
  ProductId,
} from "../types/products.types";

interface UseDeleteProductOptions {
  onSuccess?: (data: DeleteProductResponse, variables: ProductId) => void;
  onError?: (error: ApiError, variables: ProductId) => void;
  onSettled?: (
    data: DeleteProductResponse | undefined,
    error: ApiError | null,
    variables: ProductId,
  ) => void;
}

export function useDeleteProduct(options: UseDeleteProductOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<DeleteProductResponse, ApiError, ProductId>({
    mutationKey: [...queryKeys.products.all, "delete"] as const,
    mutationFn: deleteProduct,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.removeQueries({
        queryKey: queryKeys.products.detail(variables),
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
    deleteProduct: mutation.mutate,
    deleteProductAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
