import { ApiClient } from "@repo/core/client";

const PRODUCTS_API_URL =
  process.env.NEXT_PUBLIC_PRODUCTS_API_URL ?? "/api/products";

export const productsClient = new ApiClient(PRODUCTS_API_URL);
