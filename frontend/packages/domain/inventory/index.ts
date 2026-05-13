export type {
  InventoryResponse,
  InventoryItem,
  InventoryListParams,
  InventoryProductId,
  InventorySeverity,
  LowStockAlert,
  LowStockResponse,
  UpdateStockRequest,
  UpdateStockResponse,
  UpdateStockVariables,
} from "./types/inventory.types";

export {
  getInventory,
  getLowStock,
  updateStock,
} from "./api/inventory.api";

export { useInventory } from "./hooks/useInventory";
export { useLowStock } from "./hooks/useLowStock";
export { useUpdateStock } from "./hooks/useUpdateStock";
