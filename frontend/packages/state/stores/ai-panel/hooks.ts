"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useAiPanelChatStoreContext } from "./provider";
import type { ChatActions, ChatStore, OptimisticChatMessage } from "./types";

type AiPanelChatSelector<T> = (state: ChatStore) => T;

const selectSessionId = (state: ChatStore) => state.sessionId;
const selectOptimisticMessages = (state: ChatStore) => state.optimisticMessages;
const selectIsTyping = (state: ChatStore) => state.isTyping;
const selectPendingMessage = (state: ChatStore) => state.pendingMessage;

export function useAiPanelChatStore<T>(selector: AiPanelChatSelector<T>): T {
  const store = useAiPanelChatStoreContext();
  return useStore(store, selector);
}

export function useAiPanelSessionId(): string | null {
  return useAiPanelChatStore(selectSessionId);
}

export function useAiPanelOptimisticMessages(): OptimisticChatMessage[] {
  return useAiPanelChatStore(selectOptimisticMessages);
}

export function useAiPanelIsTyping(): boolean {
  return useAiPanelChatStore(selectIsTyping);
}

export function useAiPanelPendingMessage(): string {
  return useAiPanelChatStore(selectPendingMessage);
}

export function useAiPanelChatActions(): ChatActions {
  const setSessionId = useAiPanelChatStore((state) => state.setSessionId);
  const ensureSessionId = useAiPanelChatStore((state) => state.ensureSessionId);
  const addOptimisticMessage = useAiPanelChatStore(
    (state) => state.addOptimisticMessage,
  );
  const removeMessage = useAiPanelChatStore((state) => state.removeMessage);
  const replaceOptimisticMessage = useAiPanelChatStore(
    (state) => state.replaceOptimisticMessage,
  );
  const appendAssistantMessage = useAiPanelChatStore(
    (state) => state.appendAssistantMessage,
  );
  const setTyping = useAiPanelChatStore((state) => state.setTyping);
  const setPendingMessage = useAiPanelChatStore(
    (state) => state.setPendingMessage,
  );
  const clearMessages = useAiPanelChatStore((state) => state.clearMessages);
  const clearChat = useAiPanelChatStore((state) => state.clearChat);

  return useMemo(
    () => ({
      setSessionId,
      ensureSessionId,
      addOptimisticMessage,
      removeMessage,
      replaceOptimisticMessage,
      appendAssistantMessage,
      setTyping,
      setPendingMessage,
      clearMessages,
      clearChat,
    }),
    [
      addOptimisticMessage,
      appendAssistantMessage,
      clearMessages,
      clearChat,
      ensureSessionId,
      removeMessage,
      replaceOptimisticMessage,
      setPendingMessage,
      setSessionId,
      setTyping,
    ],
  );
}
