import { createStore } from "zustand/vanilla";

import type { ChatStore, ChatStoreInitialState } from "./types";

const defaultChatState = {
  sessionId: null,
  optimisticMessages: [],
  isTyping: false,
  pendingMessage: "",
} satisfies ChatStoreInitialState;

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

export const createChatStore = (initialState: ChatStoreInitialState = {}) =>
  createStore<ChatStore>()((set, get) => ({
    ...defaultChatState,
    ...initialState,
    setSessionId: (sessionId) => set({ sessionId }),
    ensureSessionId: () => {
      const activeSessionId = get().sessionId;

      if (activeSessionId) {
        return activeSessionId;
      }

      const generatedSessionId = createSessionId();
      set({ sessionId: generatedSessionId });
      return generatedSessionId;
    },
    addOptimisticMessage: (message) =>
      set((state) => ({
        optimisticMessages: [...state.optimisticMessages, message],
      })),
    replaceOptimisticMessage: (messageId, nextMessage) =>
      set((state) => ({
        optimisticMessages: state.optimisticMessages.map((message) =>
          message.id === messageId ? nextMessage : message,
        ),
      })),
    appendAssistantMessage: (message) =>
      set((state) => ({
        optimisticMessages: [
          ...state.optimisticMessages,
          {
            id: message.id,
            role: "assistant",
            content: message.content,
            createdAt: message.createdAt ?? new Date().toISOString(),
            isOptimistic: false,
          },
        ],
      })),
    setTyping: (isTyping) => set({ isTyping }),
    setPendingMessage: (message) => set({ pendingMessage: message }),
    clearChat: () =>
      set({
        sessionId: null,
        optimisticMessages: [],
        isTyping: false,
        pendingMessage: "",
      }),
  }));
