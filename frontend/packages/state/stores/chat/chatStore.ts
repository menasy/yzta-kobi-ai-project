import { createStore } from "zustand/vanilla";

import type { ChatStore, ChatStoreInitialState } from "./types";

const WELCOME_MESSAGE = {
  id: "welcome-message",
  role: "assistant" as const,
  content:
    "Merhaba! Ben KOBİ AI asistanınız. Size nasıl yardımcı olabilirim? İşletmenizle ilgili sorularınızı sorabilir, ürün veya siparişleriniz hakkında bilgi alabilirsiniz.",
  createdAt: new Date().toISOString(),
  isOptimistic: false,
};

const defaultChatState = {
  sessionId: null,
  optimisticMessages: [WELCOME_MESSAGE],
  isTyping: false,
  pendingMessage: "",
} satisfies ChatStoreInitialState;

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

export const createChatStore = (initialState: ChatStoreInitialState = {}) =>
  createStore<ChatStore>()((set, get) => ({
    ...defaultChatState,
    ...initialState,
    setSessionId: (sessionId) => {
      // Runtime guard against objects or invalid session IDs
      if (typeof sessionId !== "string" && sessionId !== null) {
        console.warn("Invalid sessionId ignored:", sessionId);
        return;
      }
      if (sessionId === "[object Object]") {
        console.warn("Detected [object Object] as sessionId, ignoring.");
        return;
      }
      set({ sessionId });
    },
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
    removeMessage: (messageId) =>
      set((state) => ({
        optimisticMessages: state.optimisticMessages.filter(
          (m) => m.id !== messageId,
        ),
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
    clearMessages: () =>
      set({
        optimisticMessages: [WELCOME_MESSAGE],
        isTyping: false,
        pendingMessage: "",
      }),
    clearChat: () =>
      set({
        sessionId: null,
        optimisticMessages: [WELCOME_MESSAGE],
        isTyping: false,
        pendingMessage: "",
      }),
  }));
