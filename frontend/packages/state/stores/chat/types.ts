export type ChatMessageRole = "user" | "assistant";

export interface OptimisticChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  isOptimistic: boolean;
}

export interface AssistantMessageInput {
  id: string;
  content: string;
  createdAt?: string;
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
