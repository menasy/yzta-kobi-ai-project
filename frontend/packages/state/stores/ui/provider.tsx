"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";

import type { UIStore, UIStoreInitialState } from "./types";
import { createUIStore } from "./uiStore";

const UIStoreContext = createContext<StoreApi<UIStore> | null>(null);

interface UIStoreProviderProps {
  children: ReactNode;
  initialState?: UIStoreInitialState;
}

export function UIStoreProvider({
  children,
  initialState,
}: UIStoreProviderProps) {
  const storeRef = useRef<StoreApi<UIStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createUIStore(initialState);
  }

  return (
    <UIStoreContext.Provider value={storeRef.current}>
      {children}
    </UIStoreContext.Provider>
  );
}

export function useUIStoreContext(): StoreApi<UIStore> {
  const store = useContext(UIStoreContext);

  if (!store) {
    throw new Error("useUIStore must be used within an UIStoreProvider.");
  }

  return store;
}
