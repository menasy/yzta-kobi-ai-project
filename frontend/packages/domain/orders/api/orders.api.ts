import { ordersClient } from "../../clients/orders-client";
import { toRequestParams } from "../../clients/request-params";
import type {
  DailyOrderSummaryResponse,
  OrderId,
  OrderListParams,
  OrderResponse,
  OrdersResponse,
} from "../types/orders.types";

const ORDERS_ENDPOINTS = {
  list: "",
  summaryToday: "summary/today",
  byId: (orderId: OrderId) => String(orderId),
} as const;

export function getOrders(params?: OrderListParams): Promise<OrdersResponse> {
  return ordersClient.get<OrdersResponse["data"]>(ORDERS_ENDPOINTS.list, {
    params: toRequestParams(params),
  });
}

export function getDailySummary(): Promise<DailyOrderSummaryResponse> {
  return ordersClient.get<DailyOrderSummaryResponse["data"]>(
    ORDERS_ENDPOINTS.summaryToday,
  );
}

export function getOrder(orderId: OrderId): Promise<OrderResponse> {
  return ordersClient.get<OrderResponse["data"]>(
    ORDERS_ENDPOINTS.byId(orderId),
  );
}
