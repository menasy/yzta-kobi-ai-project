export type AiActionType =
  | "product_price_bulk_update"
  | "order_status_update"
  | "inventory_threshold_update"
  | "inventory_quantity_update"
  | "shipment_refresh"
  | "notification_mark_read";

export type AiActionStatus =
  | "pending"
  | "executed"
  | "cancelled"
  | "expired";

export type AiActionSafetyLevel = "low" | "medium" | "high";

export type AiPage =
  | "dashboard"
  | "products"
  | "orders"
  | "inventory"
  | "shipments"
  | "notifications"
  | "chat";

export interface AiActionAffectedResource {
  resourceType: string;
  resourceId: string;
  label?: string | null;
}

export interface AiActionPreviewItem {
  resourceType: string;
  resourceId: string;
  label?: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  warning?: string | null;
}

export interface AiPendingActionPreview {
  actionId: string;
  actionType: AiActionType;
  title: string;
  summary: string;
  status: AiActionStatus;
  requiresConfirmation: boolean;
  safetyLevel: AiActionSafetyLevel;
  affectedResources: AiActionAffectedResource[];
  preview: AiActionPreviewItem[];
  reason: string;
  expiresAt?: string | null;
}

export interface AiActionExecutionResult {
  actionId?: string;
  groupId?: string;
  actionType?: AiActionType;
  status?: Extract<AiActionStatus, "executed" | "cancelled" | "expired">;
  affectedCount?: number;
  message?: string | null;
  results?: readonly Record<string, unknown>[];
  executed?: boolean;
}

export interface AiPendingActionGroup {
  groupId: string;
  title: string;
  summary: string;
  status: AiActionStatus;
  requiresConfirmation: boolean;
  safetyLevel: AiActionSafetyLevel;
  actionCount: number;
  actions: AiPendingActionPreview[];
  createdAt: string;
  expiresAt: string;
}

export interface AiInsight {
  dataQualityNote?: string;
  candidates?: Record<string, unknown>[];
  page?: string;
  orders?: Record<string, unknown>;
  products?: Record<string, unknown>;
  inventory?: Record<string, unknown>;
  shipments?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AiPageContext {
  page: AiPage;
  pathname: string;
  selectedProductId?: string;
  selectedOrderId?: string;
  selectedTrackingNumber?: string;
}

export interface AiQuickAction {
  id: string;
  label: string;
  prompt: string;
}
