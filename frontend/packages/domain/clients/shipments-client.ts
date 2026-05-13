import { ApiClient } from "@repo/core/client";

const SHIPMENTS_API_URL =
  process.env.NEXT_PUBLIC_SHIPMENTS_API_URL ?? "/api/shipments";

export const shipmentsClient = new ApiClient(SHIPMENTS_API_URL);
