import { ApiClient } from "@repo/core/client";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "/api/auth";

export const authClient = new ApiClient(AUTH_API_URL);
