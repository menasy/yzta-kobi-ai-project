export type {
  MarkAllNotificationsReadData,
  MarkAllNotificationsReadResponse,
  NotificationId,
  NotificationListItem,
  NotificationMarkReadData,
  NotificationMarkReadResponse,
  NotificationSeverity,
  NotificationsResponse,
  UnreadNotificationsResponse,
} from "./types/notifications.types";

export {
  createNotificationsEventSource,
  getNotifications,
  getNotificationsStreamUrl,
  getUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./api/notifications.api";

export { useMarkAllNotificationsRead } from "./hooks/useMarkAllNotificationsRead";
export { useMarkNotificationRead } from "./hooks/useMarkNotificationRead";
export { useNotifications } from "./hooks/useNotifications";
export { useNotificationStream } from "./hooks/useNotificationStream";
export { useUnreadNotifications } from "./hooks/useUnreadNotifications";
