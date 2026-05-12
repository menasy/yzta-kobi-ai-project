import { ApiClient } from "@repo/core/client";

const CUSTOMER_SUPPORT_API_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_SUPPORT_API_URL ?? "/api/support";

export const customerSupportClient = new ApiClient(CUSTOMER_SUPPORT_API_URL);
