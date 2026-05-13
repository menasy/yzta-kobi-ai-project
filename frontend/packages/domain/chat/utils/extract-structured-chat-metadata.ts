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

function normalizeMetadata(raw: any): any {
  if (!raw || typeof raw !== "object") return raw;
  if (Array.isArray(raw)) return raw.map(normalizeMetadata);

  const normalized: any = {};
  for (const key in raw) {
    // Map snake_case to camelCase for common fields
    let newKey = key;
    if (key === "pending_action") newKey = "pendingAction";
    if (key === "pending_action_group") newKey = "pendingActionGroup";
    if (key === "execution_result") newKey = "actionExecution";
    if (key === "action_id") newKey = "actionId";
    if (key === "group_id") newKey = "groupId";
    if (key === "action_type") newKey = "actionType";
    if (key === "safety_level") newKey = "safetyLevel";
    if (key === "requires_confirmation") newKey = "requiresConfirmation";
    if (key === "affected_resources") newKey = "affectedResources";
    if (key === "action_count") newKey = "actionCount";
    if (key === "created_at") newKey = "createdAt";
    if (key === "expires_at") newKey = "expiresAt";
    if (key === "product_name") newKey = "productName";
    if (key === "product_id") newKey = "productId";
    if (key === "resource_type") newKey = "resourceType";
    if (key === "resource_id") newKey = "resourceId";
    if (key === "affected_count") newKey = "affectedCount";

    normalized[newKey] = normalizeMetadata(raw[key]);
  }
  return normalized;
}

function extractFromRaw(metadata: Record<string, unknown> | null | undefined): ChatStructuredMetadata {
  if (!metadata) return EMPTY_CHAT_STRUCTURED_METADATA;

  const normalized = normalizeMetadata(metadata);

  return {
    pendingAction: (normalized.pendingAction as AiPendingActionPreview) || null,
    pendingActionGroup: (normalized.pendingActionGroup as AiPendingActionGroup) || null,
    actionExecution: (normalized.actionExecution as AiActionExecutionResult) || null,
    insight: (normalized.insight as AiInsight) || null,
    error: (normalized.error as Record<string, unknown>) || null,
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
