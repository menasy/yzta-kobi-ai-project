export type {
  BulkUpdateStockRequest,
  InventoryItem,
  InventoryListParams,
  LowStockAlert,
  LowStockResponse,
  StockUpdateItem,
  UpdateStockRequest,
  UpdateStockResponse,
} from "./types/inventory.types";

export {
  getLowStock,
  updateStock,
} from "./api/inventory.api";

export { useLowStock } from "./hooks/useLowStock";
export { useUpdateStock } from "./hooks/useUpdateStock";
