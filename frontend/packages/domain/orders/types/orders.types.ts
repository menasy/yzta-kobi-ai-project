import type { ApiResponse } from "@repo/core";

export type OrderId = number | string;
export type OrderStatus = string;

export interface OrderItem extends Record<string, unknown> {
  id?: number;
  product_id?: number;
  product_name?: string;
  sku?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
}

export interface Order extends Record<string, unknown> {
  id?: OrderId;
  order_id?: OrderId;
  customer_id?: number | string;
  customer_name?: string | null;
  status?: OrderStatus;
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface OrderListParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  customerId?: number | string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DailyOrderSummary {
  total_orders: number;
  revenue: number;
}

export type OrdersResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;
export type DailyOrderSummaryResponse = ApiResponse<DailyOrderSummary>;
