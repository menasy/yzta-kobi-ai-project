"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { StoreApi } from "zustand";

import { createMessageStore } from "./messageStore";
import type { MessageStore } from "./types";

const MessageStoreContext = createContext<StoreApi<MessageStore> | null>(null);

interface MessageStoreProviderProps {
  children: ReactNode;
}

export function MessageStoreProvider({ children }: MessageStoreProviderProps) {
  const storeRef = useRef<StoreApi<MessageStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createMessageStore();
  }

  useEffect(() => {
    return () => {
      if (storeRef.current) {
        storeRef.current.getState().clearAllMessages();
      }
    };
  }, []);

  return (
    <MessageStoreContext.Provider value={storeRef.current}>
      {children}
    </MessageStoreContext.Provider>
  );
}

export function useMessageStoreContext(): StoreApi<MessageStore> {
  const store = useContext(MessageStoreContext);

  if (!store) {
    throw new Error(
      "useMessageStoreContext must be used within an MessageStoreProvider."
    );
  }

  return store;
}
