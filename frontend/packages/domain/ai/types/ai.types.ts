import type { ApiResponse } from "@repo/core";

export interface AiChatRequest {
  message: string;
}

export interface AiChatData {
  response: string;
}

export type AiChatResponse = ApiResponse<AiChatData>;
