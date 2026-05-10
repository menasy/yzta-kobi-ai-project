import { chatClient } from "../../clients/chat-client";
import type {
  ChatHistoryResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

const CHAT_ENDPOINTS = {
  message: "message",
  history: "history",
} as const;

export function sendMessage(
  data: SendMessageRequest,
): Promise<SendMessageResponse> {
  return chatClient.post<SendMessageResponse["data"], SendMessageRequest>(
    CHAT_ENDPOINTS.message,
    data,
  );
}

export function getChatHistory(): Promise<ChatHistoryResponse> {
  return chatClient.get<ChatHistoryResponse["data"]>(CHAT_ENDPOINTS.history);
}
