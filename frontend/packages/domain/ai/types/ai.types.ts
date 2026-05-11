import type { ApiResponse } from "@repo/core";

export interface AiChatRequest {
  session_id: string;
  content: string;
}

export interface AiChatData {
  reply: string;
  session_id: string;
}

export type AiChatResponse = ApiResponse<AiChatData>;
