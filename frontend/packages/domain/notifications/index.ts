export type {
  DailySummaryData,
  DailySummaryResponse,
  MarkAllNotificationsReadData,
  MarkAllNotificationsReadResponse,
  NotificationId,
  NotificationListItem,
  NotificationListParams,
  NotificationMarkReadData,
  NotificationMarkReadResponse,
  NotificationSeverity,
  NotificationStreamEvent,
  NotificationsResponse,
  NotificationType,
  SummaryUpdateData,
  UnreadNotificationsResponse,
} from "./types/notifications.types";

export {
  createNotificationsEventSource,
  getNotificationDailySummary,
  getNotifications,
  getNotificationsStreamUrl,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api/notifications.api";

export { useNotificationDailySummary } from "./hooks/useDailySummary";
export { useMarkAllNotificationsRead } from "./hooks/useMarkAllNotificationsRead";
export { useMarkNotificationRead } from "./hooks/useMarkNotificationRead";
export { useNotifications } from "./hooks/useNotifications";
export { useNotificationStream } from "./hooks/useNotificationStream";
export { useUnreadNotifications } from "./hooks/useUnreadNotifications";
