import type { ChatMessage } from "@repo/domain/chat/types/chat.types";
import type { OptimisticChatMessage } from "@repo/state/stores/chat/types";

/* ── Panel Container ──────────────────────────────────────────── */

export interface AiAssistantPanelProps {
  className?: string;
}

/* ── Floating Action Button ───────────────────────────────────── */

export interface AiAssistantButtonProps {
  onClick: () => void;
  className?: string;
}

/* ── Panel Header ─────────────────────────────────────────────── */

export interface AiAssistantHeaderProps {
  onClose: () => void;
  onClearChat: () => void;
  isClearPending?: boolean;
  contextBadge?: string | null;
}

/* ── Message List ─────────────────────────────────────────────── */

export interface AiAssistantMessageListProps {
  messages: (ChatMessage | OptimisticChatMessage)[];
  isTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

/* ── Single Message ───────────────────────────────────────────── */

export interface AiAssistantMessageProps {
  message: ChatMessage | OptimisticChatMessage;
  isOptimistic?: boolean;
}

/* ── Input ────────────────────────────────────────────────────── */

export interface AiAssistantInputProps {
  onSendMessage: (content: string) => void;
  isPending: boolean;
  disabled?: boolean;
}

/* ── Empty State ──────────────────────────────────────────────── */

export interface AiAssistantEmptyStateProps {
  className?: string;
}

/* ── Error State ──────────────────────────────────────────────── */

export interface AiAssistantErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/* ── Typing Indicator ─────────────────────────────────────────── */

export interface AiAssistantTypingIndicatorProps {
  className?: string;
}

/* ── Context Badge (ileride genişletilecek) ────────────────────── */

export interface AiAssistantContextBadgeProps {
  role?: string | null;
  pageName?: string | null;
}

/* ── Window (logic orchestrator) ──────────────────────────────── */

export interface AiAssistantWindowProps {
  isOpen: boolean;
  onClose: () => void;
}
