export type ChatMessageRole = "user" | "assistant" | "system";
type OptimisticActionType =
  | "product_price_bulk_update"
  | "order_status_update"
  | "inventory_threshold_update"
  | "inventory_quantity_update"
  | "shipment_refresh"
  | "notification_mark_read";
type OptimisticActionStatus =
  | "pending"
  | "executed"
  | "cancelled"
  | "expired";
type OptimisticActionSafetyLevel = "low" | "medium" | "high";

interface OptimisticActionAffectedResource {
  resourceType: string;
  resourceId: string;
  label?: string | null;
}

interface OptimisticActionPreviewItem {
  resourceType: string;
  resourceId: string;
  label?: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  warning?: string | null;
}

interface OptimisticPendingActionPreview {
  actionId: string;
  actionType: OptimisticActionType;
  title: string;
  summary: string;
  status: OptimisticActionStatus;
  requiresConfirmation: boolean;
  safetyLevel: OptimisticActionSafetyLevel;
  affectedResources: OptimisticActionAffectedResource[];
  preview: OptimisticActionPreviewItem[];
  reason: string;
  expiresAt?: string | null;
}

interface OptimisticActionExecutionResult {
  actionId: string;
  actionType: OptimisticActionType;
  status: Extract<OptimisticActionStatus, "executed" | "cancelled" | "expired">;
  affectedCount?: number;
  message?: string | null;
  results?: readonly Record<string, unknown>[];
}

export interface OptimisticChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  isOptimistic: boolean;
  pendingAction?: OptimisticPendingActionPreview | null;
  actionExecution?: OptimisticActionExecutionResult | null;
}

export interface AssistantMessageInput {
  id: string;
  content: string;
  createdAt?: string;
  pendingAction?: OptimisticPendingActionPreview | null;
  actionExecution?: OptimisticActionExecutionResult | null;
}

export interface ChatState {
  sessionId: string | null;
  optimisticMessages: OptimisticChatMessage[];
  isTyping: boolean;
  pendingMessage: string;
}

export interface ChatActions {
  setSessionId: (sessionId: string | null) => void;
  ensureSessionId: () => string;
  addOptimisticMessage: (message: OptimisticChatMessage) => void;
  removeMessage: (messageId: string) => void;
  replaceOptimisticMessage: (
    messageId: string,
    nextMessage: OptimisticChatMessage,
  ) => void;
  appendAssistantMessage: (message: AssistantMessageInput) => void;
  setTyping: (isTyping: boolean) => void;
  setPendingMessage: (message: string) => void;
  clearMessages: () => void;
  clearChat: () => void;
}

export type ChatStore = ChatState & ChatActions;

export type ChatStoreInitialState = Partial<ChatState>;
