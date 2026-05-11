import type { ApiResponse } from "@repo/core";

export type OrderId = number | string;
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
  shipping?: OrderShipping;
  notes?: string | null;
}

export interface OrderListParams
  extends Record<string, string | number | boolean | null | undefined> {
  status?: OrderStatus;
}

export interface CreateOrderItem {
  product_id: number;
  quantity: number;
}

export interface OrderShipping {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  shipping: OrderShipping;
  notes?: string | null;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string | null;
}

export interface DailyOrderSummary {
  date: string;
  total_orders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  total_revenue: number;
}

export type CreateOrderResponse = ApiResponse<Order>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderResponse = ApiResponse<Order>;
export type UpdateOrderStatusResponse = ApiResponse<Order>;
export type DailyOrderSummaryResponse = ApiResponse<DailyOrderSummary>;
