"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getUnreadNotifications } from "../api/notifications.api";
import type { UnreadNotificationsResponse } from "../types/notifications.types";

interface UseUnreadNotificationsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useUnreadNotifications(
  options: UseUnreadNotificationsOptions = {},
) {
  const query = useQuery<UnreadNotificationsResponse, ApiError>({
    queryKey: queryKeys.notifications.unread(),
    queryFn: getUnreadNotifications,
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
