import { aiClient } from "../../clients/ai-client";
import type {
  AiChatRequest,
  AiChatResponse,
} from "../types/ai.types";

const AI_ENDPOINTS = {
  chat: "chat",
} as const;

export function sendAiChatMessage(
  data: AiChatRequest,
): Promise<AiChatResponse> {
  return aiClient.post<AiChatResponse["data"], AiChatRequest>(
    AI_ENDPOINTS.chat,
    data,
  );
}
