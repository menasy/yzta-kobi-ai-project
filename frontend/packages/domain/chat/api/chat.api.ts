import { chatClient } from "../../clients/chat-client";
import type {
  ChatConversationDetailResponse,
  ChatConversationsResponse,
  ChatHistoryResponse,
  ClearChatHistoryResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

const CHAT_ENDPOINTS = {
  message: "message",
  conversations: "conversations",
  conversation: (sessionId: string) => {
    if (typeof sessionId !== "string" || sessionId === "[object Object]") {
      throw new Error(`Invalid sessionId provided to API: ${sessionId}`);
    }
    return `conversations/${sessionId}`;
  },
  history: (sessionId: string) => {
    if (typeof sessionId !== "string" || sessionId === "[object Object]") {
      throw new Error(`Invalid sessionId provided to API: ${sessionId}`);
    }
    return `history/${sessionId}`;
  },
} as const;

// ── Conversation CRUD ───────────────────────────────────

export function getChatConversations(): Promise<ChatConversationsResponse> {
  return chatClient.get<ChatConversationsResponse["data"]>(
    CHAT_ENDPOINTS.conversations,
  );
}

export function getChatConversation(
  sessionId: string,
): Promise<ChatConversationDetailResponse> {
  return chatClient.get<ChatConversationDetailResponse["data"]>(
    CHAT_ENDPOINTS.conversation(sessionId),
  );
}

export function createChatConversation(
  data?: CreateConversationRequest,
): Promise<CreateConversationResponse> {
  return chatClient.post<CreateConversationResponse["data"], CreateConversationRequest>(
    CHAT_ENDPOINTS.conversations,
    data ?? {},
  );
}

export function deleteChatConversation(
  sessionId: string,
): Promise<DeleteConversationResponse> {
  return chatClient.delete<DeleteConversationResponse["data"]>(
    CHAT_ENDPOINTS.conversation(sessionId),
  );
}

// ── Message ─────────────────────────────────────────────

export function sendMessage(
  data: SendMessageRequest,
): Promise<SendMessageResponse> {
  return chatClient.post<SendMessageResponse["data"], SendMessageRequest>(
    CHAT_ENDPOINTS.message,
    data,
  );
}

// ── Legacy History ──────────────────────────────────────

export function getChatHistory(
  sessionId: string,
): Promise<ChatHistoryResponse> {
  return chatClient.get<ChatHistoryResponse["data"]>(
    CHAT_ENDPOINTS.history(sessionId),
  );
}

export function clearChatHistory(
  sessionId: string,
): Promise<ClearChatHistoryResponse> {
  return chatClient.delete<ClearChatHistoryResponse["data"]>(
    CHAT_ENDPOINTS.history(sessionId),
  );
}
