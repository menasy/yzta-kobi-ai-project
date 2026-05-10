import { ApiClient } from "@repo/core/client";

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL ?? "/api/chat";

export const chatClient = new ApiClient(CHAT_API_URL);
