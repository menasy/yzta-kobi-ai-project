"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";

import { createChatStore } from "./chatStore";
import type { ChatStore, ChatStoreInitialState } from "./types";

const ChatStoreContext = createContext<StoreApi<ChatStore> | null>(null);

interface ChatStoreProviderProps {
  children: ReactNode;
  initialState?: ChatStoreInitialState;
}

export function ChatStoreProvider({
  children,
  initialState,
}: ChatStoreProviderProps) {
  const storeRef = useRef<StoreApi<ChatStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createChatStore(initialState);
  }

  return (
    <ChatStoreContext.Provider value={storeRef.current}>
      {children}
    </ChatStoreContext.Provider>
  );
}

export function useChatStoreContext(): StoreApi<ChatStore> {
  const store = useContext(ChatStoreContext);

  if (!store) {
    throw new Error("useChatStore must be used within an ChatStoreProvider.");
  }

  return store;
}
