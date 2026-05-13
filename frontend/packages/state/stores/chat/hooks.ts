"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useChatStoreContext } from "./provider";
import type { ChatActions, ChatStore, OptimisticChatMessage } from "./types";

type ChatSelector<T> = (state: ChatStore) => T;

const selectSessionId = (state: ChatStore) => state.sessionId;
const selectOptimisticMessages = (state: ChatStore) => state.optimisticMessages;
const selectIsTyping = (state: ChatStore) => state.isTyping;
const selectPendingMessage = (state: ChatStore) => state.pendingMessage;

export function useChatStore<T>(selector: ChatSelector<T>): T {
  const store = useChatStoreContext();

  return useStore(store, selector);
}

export function useChatSessionId(): string | null {
  return useChatStore(selectSessionId);
}

export function useOptimisticMessages(): OptimisticChatMessage[] {
  return useChatStore(selectOptimisticMessages);
}

export function useIsTyping(): boolean {
  return useChatStore(selectIsTyping);
}

export function usePendingMessage(): string {
  return useChatStore(selectPendingMessage);
}

export function useChatActions(): ChatActions {
  const setSessionId = useChatStore((state) => state.setSessionId);
  const ensureSessionId = useChatStore((state) => state.ensureSessionId);
  const addOptimisticMessage = useChatStore(
    (state) => state.addOptimisticMessage,
  );
  const removeMessage = useChatStore((state) => state.removeMessage);
  const replaceOptimisticMessage = useChatStore(
    (state) => state.replaceOptimisticMessage,
  );
  const appendAssistantMessage = useChatStore(
    (state) => state.appendAssistantMessage,
  );
  const setTyping = useChatStore((state) => state.setTyping);
  const setPendingMessage = useChatStore((state) => state.setPendingMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const clearChat = useChatStore((state) => state.clearChat);

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
