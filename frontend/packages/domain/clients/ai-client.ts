import { ApiClient } from "@repo/core/client";

const AI_API_URL =
  process.env.NEXT_PUBLIC_AI_API_URL ?? "/api/ai";

export const aiClient = new ApiClient(AI_API_URL);
