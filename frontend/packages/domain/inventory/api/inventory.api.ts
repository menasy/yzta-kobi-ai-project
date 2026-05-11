import { inventoryClient } from "../../clients/inventory-client";
import { toRequestParams } from "../../clients/request-params";
import type {
  InventoryListParams,
  InventoryProductId,
  InventoryResponse,
  LowStockResponse,
  UpdateStockRequest,
  UpdateStockResponse,
} from "../types/inventory.types";

const INVENTORY_ENDPOINTS = {
  list: "",
  lowStock: "low-stock",
  byProductId: (productId: InventoryProductId) => String(productId),
} as const;

export function getInventory(
  params?: InventoryListParams,
): Promise<InventoryResponse> {
  return inventoryClient.get<InventoryResponse["data"]>(
    INVENTORY_ENDPOINTS.list,
    { params: toRequestParams(params) },
  );
}

export function getLowStock(): Promise<LowStockResponse> {
  return inventoryClient.get<LowStockResponse["data"]>(
    INVENTORY_ENDPOINTS.lowStock,
  );
}

export function updateStock(
  productId: InventoryProductId,
  data: UpdateStockRequest,
): Promise<UpdateStockResponse> {
  return inventoryClient.put<UpdateStockResponse["data"], UpdateStockRequest>(
    INVENTORY_ENDPOINTS.byProductId(productId),
    data,
  );
}
