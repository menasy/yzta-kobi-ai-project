import { ordersClient } from "../../clients/orders-client";
import { toRequestParams } from "../../clients/request-params";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  DailyOrderSummaryResponse,
  DashboardOverviewResponse,
  OrderId,
  OrderListParams,
  OrderResponse,
  OrdersResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from "../types/orders.types";

const ORDERS_ENDPOINTS = {
  list: "",
  my: "my",
  myById: (orderId: OrderId) => `my/${String(orderId)}`,
  summaryToday: "summary/today",
  dashboardOverview: "dashboard/overview",
  byId: (orderId: OrderId) => String(orderId),
  status: (orderId: OrderId) => `${String(orderId)}/status`,
} as const;

export function createOrder(
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  return ordersClient.post<CreateOrderResponse["data"], CreateOrderRequest>(
    ORDERS_ENDPOINTS.list,
    data,
  );
}

export function getMyOrders(): Promise<OrdersResponse> {
  return ordersClient.get<OrdersResponse["data"]>(ORDERS_ENDPOINTS.my);
}

export function getMyOrder(orderId: OrderId): Promise<OrderResponse> {
  return ordersClient.get<OrderResponse["data"]>(
    ORDERS_ENDPOINTS.myById(orderId),
  );
}

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

export function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  return ordersClient.get<DashboardOverviewResponse["data"]>(
    ORDERS_ENDPOINTS.dashboardOverview,
  );
}

export function getOrder(orderId: OrderId): Promise<OrderResponse> {
  return ordersClient.get<OrderResponse["data"]>(
    ORDERS_ENDPOINTS.byId(orderId),
  );
}

export function updateOrderStatus(
  orderId: OrderId,
  data: UpdateOrderStatusRequest,
): Promise<UpdateOrderStatusResponse> {
  return ordersClient.patch<
    UpdateOrderStatusResponse["data"],
    UpdateOrderStatusRequest
  >(ORDERS_ENDPOINTS.status(orderId), data);
}
