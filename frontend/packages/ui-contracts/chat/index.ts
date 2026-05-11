import type { ChatMessage, MessageRole } from "@repo/domain/chat/types/chat.types";
import type { OptimisticChatMessage } from "@repo/state/stores/chat/types";

export interface ChatMessageProps {
  message: ChatMessage | OptimisticChatMessage;
  isOptimistic?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isPending: boolean;
  disabled?: boolean;
}

export interface ChatMessageListProps {
  messages: (ChatMessage | OptimisticChatMessage)[];
  isTyping: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export interface ChatWindowProps {
  className?: string;
}
