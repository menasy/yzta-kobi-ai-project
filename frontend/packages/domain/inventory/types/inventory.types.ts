import type { ApiResponse } from "@repo/core";

export interface InventoryItem extends Record<string, unknown> {
  product_id?: number;
  product_name?: string;
  sku?: string;
  quantity?: number;
  stock?: number;
  threshold?: number;
  low_stock_threshold?: number;
  updated_at?: string;
}

export type LowStockAlert = InventoryItem;

export interface StockUpdateItem {
  product_id: number;
  quantity: number;
}

export interface BulkUpdateStockRequest {
  updates: StockUpdateItem[];
}

export type UpdateStockRequest = StockUpdateItem | BulkUpdateStockRequest;

export interface InventoryListParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  pageSize?: number;
  search?: string;
  productId?: number | string;
  belowThreshold?: boolean;
}

export type LowStockResponse = ApiResponse<LowStockAlert[]>;
export type UpdateStockResponse = ApiResponse<InventoryItem[] | InventoryItem | null>;
