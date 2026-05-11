import type { ApiResponse } from "@repo/core";

export type NotificationId = number | string;
export type NotificationSeverity = "info" | "warning" | "critical";

export interface NotificationListItem extends Record<string, unknown> {
  id: NotificationId;
  title?: string | null;
  message?: string | null;
  severity?: NotificationSeverity;
  is_read?: boolean;
  created_at?: string;
  read_at?: string | null;
}

export interface NotificationMarkReadData extends Record<string, unknown> {
  id: NotificationId;
  is_read: boolean;
  read_at?: string | null;
}

export interface MarkAllNotificationsReadData {
  updated_count: number;
}

export type NotificationsResponse = ApiResponse<NotificationListItem[]>;
export type UnreadNotificationsResponse = ApiResponse<NotificationListItem[]>;
export type NotificationMarkReadResponse =
  ApiResponse<NotificationMarkReadData>;
export type MarkAllNotificationsReadResponse =
  ApiResponse<MarkAllNotificationsReadData>;
