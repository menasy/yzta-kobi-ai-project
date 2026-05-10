import { ApiClient } from "@repo/core/client";

const INVENTORY_API_URL =
  process.env.NEXT_PUBLIC_INVENTORY_API_URL ?? "/api/inventory";

export const inventoryClient = new ApiClient(INVENTORY_API_URL);
