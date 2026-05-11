"use client";

import { queryKeys } from "@repo/state/query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { createNotificationsEventSource } from "../api/notifications.api";
import type { NotificationListItem } from "../types/notifications.types";

interface UseNotificationStreamOptions {
  enabled?: boolean;
  onNotification?: (notification: NotificationListItem) => void;
  onError?: (event: Event) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMessageEvent(event: Event): event is MessageEvent<string> {
  return (
    "data" in event &&
    typeof (event as MessageEvent<unknown>).data === "string"
  );
}

function isNotificationListItem(
  value: unknown,
): value is NotificationListItem {
  return (
    isRecord(value) &&
    (typeof value.id === "string" || typeof value.id === "number")
  );
}

function parseNotification(data: string): NotificationListItem | null {
  try {
    const parsed: unknown = JSON.parse(data);
    return isNotificationListItem(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function useNotificationStream(
  options: UseNotificationStreamOptions = {},
) {
  const { enabled = true, onError, onNotification } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      typeof EventSource === "undefined"
    ) {
      return undefined;
    }

    const eventSource = createNotificationsEventSource();
    const handleNotification: EventListener = (event) => {
      if (!isMessageEvent(event)) {
        return;
      }

      const notification = parseNotification(event.data);

      if (!notification) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
      onNotification?.(notification);
    };
    const handleError: EventListener = (event) => {
      onError?.(event);
    };

    eventSource.addEventListener("notification", handleNotification);
    eventSource.addEventListener("error", handleError);

    return () => {
      eventSource.removeEventListener("notification", handleNotification);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
    };
  }, [enabled, onError, onNotification, queryClient]);
}
