"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getUnreadNotifications } from "../api/notifications.api";
import type {
  NotificationListParams,
  UnreadNotificationsResponse,
} from "../types/notifications.types";

interface UseUnreadNotificationsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  params?: NotificationListParams;
}

export function useUnreadNotifications(
  options: UseUnreadNotificationsOptions = {},
) {
  const { params, ...queryOptions } = options;

  const query = useQuery<UnreadNotificationsResponse, ApiError>({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => getUnreadNotifications(params),
    enabled: queryOptions.enabled,
    refetchInterval: queryOptions.refetchInterval,
    retry: false,
  });

  const notifications = query.data?.data ?? [];

  return {
    notifications,
    unreadCount: notifications.length,
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error ?? null,
  } as const;
}
