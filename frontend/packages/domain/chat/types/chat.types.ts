import type { ApiResponse } from "@repo/core";

export type MessageRole = "user" | "assistant" | "system";

// ── Conversation Types ──────────────────────────────────

export interface ChatConversation {
  id: number;
  session_id: string;
  user_id: number | null;
  title: string | null;
  last_message_preview: string | null;
  message_count: number;
  channel: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatConversationMessage {
  id: number;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ConversationWithMessages {
  conversation: ChatConversation;
  messages: ChatConversationMessage[];
}

// ── Legacy Message Types ────────────────────────────────

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

// ── API Response Types ──────────────────────────────────

export type SendMessageResponse = ApiResponse<SendMessageData>;
export type ChatHistoryResponse = ApiResponse<ChatHistoryData>;
export type ClearChatHistoryResponse = ApiResponse<ClearChatHistoryData>;

// Conversation CRUD responses
export type ChatConversationsResponse = ApiResponse<ChatConversation[]>;
export type ChatConversationDetailResponse = ApiResponse<ConversationWithMessages>;
export type CreateConversationResponse = ApiResponse<ChatConversation>;
export type DeleteConversationResponse = ApiResponse<{ session_id: string }>;

// Create conversation request
export interface CreateConversationRequest {
  title?: string;
}
