import { inventoryClient } from "../../clients/inventory-client";
import type {
  LowStockResponse,
  UpdateStockRequest,
  UpdateStockResponse,
} from "../types/inventory.types";

const INVENTORY_ENDPOINTS = {
  lowStock: "low-stock",
  updateStock: "update-stock",
} as const;

export function getLowStock(): Promise<LowStockResponse> {
  return inventoryClient.get<LowStockResponse["data"]>(
    INVENTORY_ENDPOINTS.lowStock,
  );
}

export function updateStock(
  data: UpdateStockRequest,
): Promise<UpdateStockResponse> {
  return inventoryClient.put<UpdateStockResponse["data"], UpdateStockRequest>(
    INVENTORY_ENDPOINTS.updateStock,
    data,
  );
}
