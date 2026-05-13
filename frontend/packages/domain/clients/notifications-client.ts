import { ApiClient } from "@repo/core/client";

export const NOTIFICATIONS_API_URL =
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL ?? "/api/notifications";

export const notificationsClient = new ApiClient(NOTIFICATIONS_API_URL);
