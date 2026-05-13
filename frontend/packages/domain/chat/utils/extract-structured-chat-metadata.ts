import type {
  AiActionExecutionResult,
  AiInsight,
  AiPendingActionGroup,
  AiPendingActionPreview,
} from "../../ai-actions/types/ai-actions.types";
import type {
  ChatConversationMessage,
  SendMessageData,
} from "../types/chat.types";

export interface ChatStructuredMetadata {
  pendingAction: AiPendingActionPreview | null;
  pendingActionGroup: AiPendingActionGroup | null;
  actionExecution: AiActionExecutionResult | null;
  insight: AiInsight | null;
  error: Record<string, unknown> | null;
}

const EMPTY_CHAT_STRUCTURED_METADATA: ChatStructuredMetadata = {
  pendingAction: null,
  pendingActionGroup: null,
  actionExecution: null,
  insight: null,
  error: null,
};

function extractFromRaw(metadata: Record<string, unknown> | null | undefined): ChatStructuredMetadata {
  if (!metadata) return EMPTY_CHAT_STRUCTURED_METADATA;

  return {
    pendingAction: (metadata.pending_action as AiPendingActionPreview) || null,
    pendingActionGroup: (metadata.pending_action_group as AiPendingActionGroup) || null,
    actionExecution: (metadata.execution_result as AiActionExecutionResult) || null,
    insight: (metadata.insight as AiInsight) || null,
    error: (metadata.error as Record<string, unknown>) || null,
  };
}

export function extractStructuredChatMessageMetadata(
  message: ChatConversationMessage,
): ChatStructuredMetadata {
  return extractFromRaw(message.metadata_);
}

export function extractStructuredSendMessageMetadata(
  data: SendMessageData,
): ChatStructuredMetadata {
  return extractFromRaw(data.metadata);
}
