import type { AiActionType } from "../types/ai-actions.types";

const AI_ACTION_TYPE_LABELS: Record<AiActionType, string> = {
  product_price_bulk_update: "Ürün fiyat güncellemesi",
  order_status_update: "Sipariş durumu güncellemesi",
  inventory_threshold_update: "Stok eşiği güncellemesi",
  inventory_quantity_update: "Stok miktarı güncellemesi",
  shipment_refresh: "Kargo durumu yenileme",
  notification_mark_read: "Bildirimleri okundu yapma",
};

export function getAiActionTypeLabel(actionType: AiActionType): string {
  return AI_ACTION_TYPE_LABELS[actionType];
}
