import { ApiClient } from "@repo/core/client";

const ORDERS_API_URL =
  process.env.NEXT_PUBLIC_ORDERS_API_URL ?? "/api/orders";

export const ordersClient = new ApiClient(ORDERS_API_URL);
