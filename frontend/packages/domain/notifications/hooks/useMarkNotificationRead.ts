"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationRead } from "../api/notifications.api";
import type {
  NotificationId,
  NotificationMarkReadResponse,
} from "../types/notifications.types";

interface UseMarkNotificationReadOptions {
  onSuccess?: (
    data: NotificationMarkReadResponse,
    variables: NotificationId,
  ) => void;
  onError?: (error: ApiError, variables: NotificationId) => void;
  onSettled?: (
    data: NotificationMarkReadResponse | undefined,
    error: ApiError | null,
    variables: NotificationId,
  ) => void;
}

export function useMarkNotificationRead(
  options: UseMarkNotificationReadOptions = {},
) {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    NotificationMarkReadResponse,
    ApiError,
    NotificationId
  >({
    mutationKey: [...queryKeys.notifications.all, "markRead"] as const,
    mutationFn: markNotificationRead,
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
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
    markNotificationRead: mutation.mutate,
    markNotificationReadAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
