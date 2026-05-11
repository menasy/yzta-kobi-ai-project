"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllNotificationsRead } from "../api/notifications.api";
import type { MarkAllNotificationsReadResponse } from "../types/notifications.types";

interface UseMarkAllNotificationsReadOptions {
  onSuccess?: (data: MarkAllNotificationsReadResponse) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (
    data: MarkAllNotificationsReadResponse | undefined,
    error: ApiError | null,
  ) => void;
}

export function useMarkAllNotificationsRead(
  options: UseMarkAllNotificationsReadOptions = {},
) {
  const queryClient = useQueryClient();
  const mutation = useMutation<MarkAllNotificationsReadResponse, ApiError, void>(
    {
      mutationKey: [...queryKeys.notifications.all, "markAllRead"] as const,
      mutationFn: markAllNotificationsRead,
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.all,
        });
        options.onSuccess?.(data);
      },
      onError: (error) => {
        options.onError?.(error);
      },
      onSettled: (data, error) => {
        options.onSettled?.(data, error ?? null);
      },
    },
  );

  return {
    markAllNotificationsRead: mutation.mutate,
    markAllNotificationsReadAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
