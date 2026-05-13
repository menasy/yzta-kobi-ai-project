import type { ApiResponse } from "@repo/core";

export type InventoryProductId = number | string;
export type InventorySeverity = "info" | "warning" | "critical";

export interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  product_name: string;
  product_sku: string;
}

export interface LowStockAlert {
  product_id: number;
  product_name: string;
  product_sku: string;
  current_quantity: number;
  threshold: number;
  severity: InventorySeverity;
}

export interface UpdateStockRequest {
  quantity: number;
  low_stock_threshold?: number;
}

export interface UpdateStockVariables {
  productId: InventoryProductId;
  data: UpdateStockRequest;
}

export interface InventoryListParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  size?: number;
}

export type InventoryResponse = ApiResponse<InventoryItem[]>;
export type LowStockResponse = ApiResponse<LowStockAlert[]>;
export type UpdateStockResponse = ApiResponse<InventoryItem>;
