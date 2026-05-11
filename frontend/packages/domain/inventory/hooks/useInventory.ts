"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getInventory } from "../api/inventory.api";
import type {
  InventoryListParams,
  InventoryResponse,
} from "../types/inventory.types";

interface UseInventoryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useInventory(
  params?: InventoryListParams,
  options: UseInventoryOptions = {},
) {
  const query = useQuery<InventoryResponse, ApiError>({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => getInventory(params),
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    inventory: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
