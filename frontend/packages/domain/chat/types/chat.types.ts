import type { ApiResponse } from "@repo/core";

export type MessageRole = "user" | "assistant" | "system";

export interface SendMessageRequest {
  message: string;
  session_id?: string | null;
}

export interface ChatMessage extends Record<string, unknown> {
  id?: number | string;
  role?: MessageRole | string;
  message?: string;
  content?: string;
  response?: string;
  session_id?: string | null;
  created_at?: string;
}

export interface SendMessageData extends Record<string, unknown> {
  response?: string;
  message?: string;
  session_id?: string | null;
}

export type SendMessageResponse = ApiResponse<SendMessageData>;
export type ChatHistoryResponse = ApiResponse<ChatMessage[]>;
