import type {
  AiActionExecutionResult,
  AiPendingActionPreview,
} from "../../ai-actions/types/ai-actions.types";
import type {
  ChatConversationMessage,
  SendMessageData,
} from "../types/chat.types";

interface ChatStructuredMetadata {
  pendingAction: AiPendingActionPreview | null;
  actionExecution: AiActionExecutionResult | null;
}

const EMPTY_CHAT_STRUCTURED_METADATA: ChatStructuredMetadata = {
  pendingAction: null,
  actionExecution: null,
};

export function extractStructuredChatMessageMetadata(
  _message: ChatConversationMessage,
): ChatStructuredMetadata {
  // Intentional no-op:
  // The current backend contract does not expose structured pending action or
  // execution metadata through conversation/history payloads. Do not parse text.
  return EMPTY_CHAT_STRUCTURED_METADATA;
}

export function extractStructuredSendMessageMetadata(
  _data: SendMessageData,
): ChatStructuredMetadata {
  // Intentional no-op:
  // The current backend contract only returns { reply, session_id }. When the
  // backend adds explicit structured metadata, update only this seam.
  return EMPTY_CHAT_STRUCTURED_METADATA;
}
