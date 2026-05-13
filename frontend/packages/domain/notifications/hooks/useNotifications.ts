"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../api/notifications.api";
import type {
  NotificationListParams,
  NotificationsResponse,
} from "../types/notifications.types";

interface UseNotificationsOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  params?: NotificationListParams;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { params } = options;
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);
  const refetchInterval = systemReady ? options.refetchInterval : false;

  const query = useQuery<NotificationsResponse, ApiError>({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => getNotifications(params),
    enabled,
    refetchInterval,
    retry: false,
  });

  const notifications = query.data?.data ?? [];

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
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
