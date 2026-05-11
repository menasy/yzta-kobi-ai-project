import { buildApiUrl } from "@repo/core/client";

import {
  NOTIFICATIONS_API_URL,
  notificationsClient,
} from "../../clients/notifications-client";
import type {
  DailySummaryResponse,
  MarkAllNotificationsReadResponse,
  NotificationId,
  NotificationListParams,
  NotificationMarkReadResponse,
  NotificationsResponse,
  UnreadNotificationsResponse,
} from "../types/notifications.types";

const NOTIFICATIONS_ENDPOINTS = {
  list: "",
  unread: "unread",
  read: (notificationId: NotificationId) => `${String(notificationId)}/read`,
  readAll: "read-all",
  stream: "stream",
  dailySummary: "daily-summary",
} as const;

export function getNotifications(
  params?: NotificationListParams,
): Promise<NotificationsResponse> {
  return notificationsClient.get<NotificationsResponse["data"]>(
    NOTIFICATIONS_ENDPOINTS.list,
    {
      params: {
        skip: params?.skip,
        limit: params?.limit,
      },
    },
  );
}

export function getUnreadNotifications(
  params?: NotificationListParams,
): Promise<UnreadNotificationsResponse> {
  return notificationsClient.get<UnreadNotificationsResponse["data"]>(
    NOTIFICATIONS_ENDPOINTS.unread,
    {
      params: {
        skip: params?.skip,
        limit: params?.limit,
      },
    },
  );
}

export function markNotificationRead(
  notificationId: NotificationId,
): Promise<NotificationMarkReadResponse> {
  return notificationsClient.patch<NotificationMarkReadResponse["data"]>(
    NOTIFICATIONS_ENDPOINTS.read(notificationId),
  );
}

export function markAllNotificationsRead(): Promise<
  MarkAllNotificationsReadResponse
> {
  return notificationsClient.patch<MarkAllNotificationsReadResponse["data"]>(
    NOTIFICATIONS_ENDPOINTS.readAll,
  );
}

export function getNotificationDailySummary(): Promise<DailySummaryResponse> {
  return notificationsClient.get<DailySummaryResponse["data"]>(
    NOTIFICATIONS_ENDPOINTS.dailySummary,
  );
}

export function getNotificationsStreamUrl(): string {
  return buildApiUrl(
    NOTIFICATIONS_API_URL,
    NOTIFICATIONS_ENDPOINTS.stream,
  );
}

export function createNotificationsEventSource(): EventSource {
  return new EventSource(getNotificationsStreamUrl(), {
    withCredentials: true,
  });
}
