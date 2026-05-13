"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";

import { createChatStore } from "../chat/chatStore";
import type { ChatStore, ChatStoreInitialState } from "../chat/types";

/**
 * AiPanelChatStoreContext — Global AI Panel için izole ChatStore context'i.
 *
 * Root ChatStoreProvider'dan tamamen bağımsızdır.
 * /chat sayfası root provider'ı kullanırken panel bu context'i kullanır;
 * böylece session ID ve optimistic message state'i çakışmaz.
 */
const AiPanelChatStoreContext = createContext<StoreApi<ChatStore> | null>(null);

interface AiPanelChatStoreProviderProps {
  children: ReactNode;
  initialState?: ChatStoreInitialState;
}

export function AiPanelChatStoreProvider({
  children,
  initialState,
}: AiPanelChatStoreProviderProps) {
  const storeRef = useRef<StoreApi<ChatStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createChatStore(initialState);
  }

  return (
    <AiPanelChatStoreContext.Provider value={storeRef.current}>
      {children}
    </AiPanelChatStoreContext.Provider>
  );
}

export function useAiPanelChatStoreContext(): StoreApi<ChatStore> {
  const store = useContext(AiPanelChatStoreContext);

  if (!store) {
    throw new Error(
      "useAiPanelChatStoreContext must be used within an AiPanelChatStoreProvider.",
    );
  }

  return store;
}
