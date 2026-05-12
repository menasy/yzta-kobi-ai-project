import { ApiClient } from "@repo/core";

export const userClient = new ApiClient(
  process.env.NEXT_PUBLIC_USER_API_URL ?? "/api/user",
);
