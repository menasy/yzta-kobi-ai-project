"use client";

import type { ReactNode } from "react";
import type { StoreApi } from "zustand";

import { useChatStoreContext } from "../chat/provider";
import type { ChatStore, ChatStoreInitialState } from "../chat/types";

/**
 * Backward-compatible AI panel chat provider.
 *
 * The panel must share the root ChatStoreProvider with the full-page chat so
 * both surfaces use the same session and optimistic state.
 */
interface AiPanelChatStoreProviderProps {
  children: ReactNode;
  initialState?: ChatStoreInitialState;
}

export function AiPanelChatStoreProvider({
  children,
}: AiPanelChatStoreProviderProps) {
  return <>{children}</>;
}

export function useAiPanelChatStoreContext(): StoreApi<ChatStore> {
  return useChatStoreContext();
}
