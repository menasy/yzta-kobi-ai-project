import type { ApiResponse } from "@repo/core";

export interface OrderLookupData {
  orderNumber: string;
  status: string;
  date: string;
  total: string;
}

export interface StockQueryData {
  productName: string;
  sku: string;
  inStock: boolean;
  quantity: number;
  location?: string;
}

export interface CargoTrackingData {
  trackingNumber: string;
  company: string;
  status: string;
  estimatedDelivery: string;
  lastUpdate: string;
}

export type OrderLookupResponse = ApiResponse<OrderLookupData>;
export type StockQueryResponse = ApiResponse<StockQueryData>;
export type CargoTrackingResponse = ApiResponse<CargoTrackingData>;
