"use client";

import { queryKeys } from "@repo/state/query";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

import { createNotificationsEventSource } from "../api/notifications.api";
import type {
  NotificationListItem,
  NotificationStreamEvent,
  SummaryUpdateData,
} from "../types/notifications.types";

/* ── SSE configuration ─────────────────────────────────────────────── */

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

/* ── Type guards ───────────────────────────────────────────────────── */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMessageEvent(event: Event): event is MessageEvent<string> {
  return (
    "data" in event &&
    typeof (event as MessageEvent<unknown>).data === "string"
  );
}

function isNotificationStreamEvent(
  value: unknown,
): value is NotificationStreamEvent {
  return (
    isRecord(value) &&
    (typeof value.id === "string" || typeof value.id === "number")
  );
}

function isSummaryUpdateData(value: unknown): value is SummaryUpdateData {
  return isRecord(value) && typeof value.summary === "string";
}

function parseNotification(data: string): NotificationStreamEvent | null {
  try {
    const parsed: unknown = JSON.parse(data);
    return isNotificationStreamEvent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseSummaryUpdate(data: string): SummaryUpdateData | null {
  try {
    const parsed: unknown = JSON.parse(data);
    return isSummaryUpdateData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Converts a NotificationStreamEvent (SSE payload) to a NotificationListItem
 * for cache insertion.
 */
function toListItem(event: NotificationStreamEvent): NotificationListItem {
  return {
    id: event.id,
    type: event.type,
    title: event.title,
    message: event.message,
    severity: event.severity,
    is_read: false,
    read_at: null,
    created_at: event.created_at,
  };
}

/* ── Hook options ──────────────────────────────────────────────────── */

interface UseNotificationStreamOptions {
  enabled?: boolean;
  onNotification?: (notification: NotificationListItem) => void;
  onSummaryUpdate?: (data: SummaryUpdateData) => void;
  onError?: (event: Event) => void;
}

/**
 * Production-grade SSE stream hook for notifications.
 *
 * Features:
 * - Exponential backoff reconnect (max 5 retries)
 * - Duplicate notification suppression via seen-ID set
 * - Handles both `notification` and `summary_update` events
 * - Ref-based callbacks to avoid effect dependency churn
 * - Full cleanup on unmount (EventSource, timers, guards)
 * - Type-safe event parsing with silent error handling
 */
export function useNotificationStream(
  options: UseNotificationStreamOptions = {},
) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  /* Ref-based callbacks to stabilize effect deps */
  const onNotificationRef = useRef(options.onNotification);
  const onSummaryUpdateRef = useRef(options.onSummaryUpdate);
  const onErrorRef = useRef(options.onError);

  useEffect(() => {
    onNotificationRef.current = options.onNotification;
  }, [options.onNotification]);

  useEffect(() => {
    onSummaryUpdateRef.current = options.onSummaryUpdate;
  }, [options.onSummaryUpdate]);

  useEffect(() => {
    onErrorRef.current = options.onError;
  }, [options.onError]);

  /* Stable invalidate function */
  const invalidateNotifications = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.notifications.all,
    });
  }, [queryClient]);

  useEffect(() => {
    if (
      !enabled ||
      typeof window === "undefined" ||
      typeof EventSource === "undefined"
    ) {
      return undefined;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const seenIds = new Set<string | number>();

    function connect(): void {
      if (!isMounted) return;

      eventSource = createNotificationsEventSource();

      /* ── notification event ──────────────────────────────────── */
      eventSource.addEventListener("notification", (event: Event) => {
        if (!isMounted || !isMessageEvent(event)) return;

        const notification = parseNotification(event.data);
        if (!notification) return;

        /* Duplicate guard */
        if (seenIds.has(notification.id)) return;
        seenIds.add(notification.id);

        /* Invalidate queries so the list refetches */
        invalidateNotifications();

        /* Optimistic insertion into unread cache (optional) */
        const listItem = toListItem(notification);
        onNotificationRef.current?.(listItem);
      });

      /* ── summary_update event ────────────────────────────────── */
      eventSource.addEventListener("summary_update", (event: Event) => {
        if (!isMounted || !isMessageEvent(event)) return;

        const summaryData = parseSummaryUpdate(event.data);
        if (!summaryData) return;

        /* Invalidate daily-summary cache */
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.dailySummary(),
        });

        onSummaryUpdateRef.current?.(summaryData);
      });

      /* ── connection opened → reset retry counter ─────────────── */
      eventSource.addEventListener("open", () => {
        retryCount = 0;
      });

      /* ── error / disconnection → controlled reconnect ────────── */
      eventSource.addEventListener("error", (event: Event) => {
        if (!isMounted) return;

        onErrorRef.current?.(event);

        /* Close current connection */
        eventSource?.close();
        eventSource = null;

        /* Give up after MAX_RETRIES consecutive failures */
        if (retryCount >= MAX_RETRIES) {
          return;
        }

        /* Exponential backoff: 1s, 2s, 4s, 8s, 16s */
        const delay = Math.min(
          BASE_DELAY_MS * Math.pow(2, retryCount),
          MAX_DELAY_MS,
        );
        retryCount += 1;

        retryTimer = setTimeout(() => {
          retryTimer = null;
          connect();
        }, delay);
      });
    }

    connect();

    /* ── Cleanup ───────────────────────────────────────────────── */
    return () => {
      isMounted = false;

      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [enabled, invalidateNotifications, queryClient]);
}
