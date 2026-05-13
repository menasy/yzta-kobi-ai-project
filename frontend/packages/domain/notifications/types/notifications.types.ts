import type { ApiResponse } from "@repo/core";

/* ── Notification severity & type ──────────────────────────────────── */

export type NotificationSeverity = "info" | "warning" | "critical";

/**
 * Known notification types from the backend.
 * Open union so unknown future types don't break the frontend.
 */
export type NotificationType = "LOW_STOCK_ALERT" | "DELIVERY_DELAY" | (string & {});

export type NotificationId = number | string;

/* ── Pagination params (skip/limit) ────────────────────────────────── */

export interface NotificationListParams {
  skip?: number;
  limit?: number;
}

/* ── List item (returned by GET /notifications, GET /unread, SSE) ──── */

export interface NotificationListItem extends Record<string, unknown> {
  id: NotificationId;
  type?: NotificationType;
  title?: string | null;
  message?: string | null;
  severity?: NotificationSeverity;
  is_read?: boolean;
  read_at?: string | null;
  created_at?: string;
}

/* ── SSE notification event (full payload from stream) ─────────────── */

export interface NotificationStreamEvent {
  id: NotificationId;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  payload?: Record<string, unknown>;
  created_at: string;
}

/* ── SSE summary_update event ──────────────────────────────────────── */

export interface SummaryUpdateData {
  summary: string;
}

/* ── PATCH mark-read response ──────────────────────────────────────── */

export interface NotificationMarkReadData extends Record<string, unknown> {
  id: NotificationId;
  is_read: boolean;
  read_at?: string | null;
  updated_at?: string | null;
}

/* ── PATCH read-all response ───────────────────────────────────────── */

export interface MarkAllNotificationsReadData {
  updated_count: number;
}

/* ── GET /daily-summary response data ──────────────────────────────── */

export interface DailySummaryData {
  summary: string;
}

/* ── API response wrappers ─────────────────────────────────────────── */

export type NotificationsResponse = ApiResponse<NotificationListItem[]>;
export type UnreadNotificationsResponse = ApiResponse<NotificationListItem[]>;
export type NotificationMarkReadResponse = ApiResponse<NotificationMarkReadData>;
export type MarkAllNotificationsReadResponse = ApiResponse<MarkAllNotificationsReadData>;
export type DailySummaryResponse = ApiResponse<DailySummaryData>;
