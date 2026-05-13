import type { ChatRenderableMessage } from "@repo/domain/chat/types/chat.types";
import type { OptimisticChatMessage } from "@repo/state/stores/chat/types";

export type ChatMessageSurface = "page" | "panel";

export interface ChatMessageProps {
  message: ChatRenderableMessage | OptimisticChatMessage;
  isOptimistic?: boolean;
  surface?: ChatMessageSurface;
  onActionMessage?: (content: string) => Promise<unknown>;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isPending: boolean;
  disabled?: boolean;
}

export interface ChatMessageListProps {
  messages: (ChatRenderableMessage | OptimisticChatMessage)[];
  isTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  surface?: ChatMessageSurface;
  onActionMessage?: (content: string) => Promise<unknown>;
}

export interface ChatWindowProps {
  className?: string;
  sessionId: string | null;
  onNewChat?: (newSessionId?: string) => void;
}
