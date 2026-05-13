import type { ApiResponse } from "@repo/core";

export type MessageRole = "user" | "assistant" | "system";

export interface SendMessageRequest {
  session_id: string;
  content: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface SendMessageData {
  reply: string;
  session_id: string;
}

export interface ChatHistoryData {
  session_id: string;
  messages: ChatMessage[];
}

export interface ClearChatHistoryData {
  session_id: string;
}

export type SendMessageResponse = ApiResponse<SendMessageData>;
export type ChatHistoryResponse = ApiResponse<ChatHistoryData>;
export type ClearChatHistoryResponse = ApiResponse<ClearChatHistoryData>;
