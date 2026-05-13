import { queryKeys } from "@repo/state/query";
import type { QueryKey } from "@tanstack/react-query";

import type { AiActionType } from "./types/ai-actions.types";

export function getAiActionInvalidationQueryKeys(
  actionType: AiActionType,
): readonly QueryKey[] {
  switch (actionType) {
    case "product_price_bulk_update":
      return [queryKeys.products.all];
    case "order_status_update":
      return [queryKeys.orders.all, queryKeys.shipments.all];
    case "inventory_threshold_update":
      return [queryKeys.inventory.all];
    case "inventory_quantity_update":
      return [
        queryKeys.inventory.all,
        queryKeys.products.all,
        queryKeys.notifications.all,
      ];
    case "shipment_refresh":
      return [queryKeys.shipments.all, queryKeys.orders.all];
    case "notification_mark_read":
      return [queryKeys.notifications.all];
    default:
      return [];
  }
}
