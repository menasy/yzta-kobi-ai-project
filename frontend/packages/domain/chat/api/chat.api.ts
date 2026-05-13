import { chatClient } from "../../clients/chat-client";
import type {
  ChatHistoryResponse,
  ClearChatHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

const CHAT_ENDPOINTS = {
  message: "message",
  history: (sessionId: string) => `history/${sessionId}`,
} as const;

export function sendMessage(
  data: SendMessageRequest,
): Promise<SendMessageResponse> {
  return chatClient.post<SendMessageResponse["data"], SendMessageRequest>(
    CHAT_ENDPOINTS.message,
    data,
  );
}

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
