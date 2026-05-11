"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../api/notifications.api";
import type { NotificationsResponse } from "../types/notifications.types";

interface UseNotificationsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const query = useQuery<NotificationsResponse, ApiError>({
    queryKey: queryKeys.notifications.list(),
    queryFn: getNotifications,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    notifications: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
