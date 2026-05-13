"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";

import { createSystemStore } from "./systemStore";
import type { SystemStore, SystemStoreInitialState } from "./types";

const SystemStoreContext = createContext<StoreApi<SystemStore> | null>(null);

interface SystemStoreProviderProps {
  children: ReactNode;
  initialState?: SystemStoreInitialState;
}

export function SystemStoreProvider({
  children,
  initialState,
}: SystemStoreProviderProps) {
  const storeRef = useRef<StoreApi<SystemStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createSystemStore(initialState);
  }

  return (
    <SystemStoreContext.Provider value={storeRef.current}>
      {children}
    </SystemStoreContext.Provider>
  );
}

export function useSystemStoreContext(): StoreApi<SystemStore> {
  const store = useContext(SystemStoreContext);

  if (!store) {
    throw new Error(
      "useSystemStore must be used within a SystemStoreProvider.",
    );
  }

  return store;
}
