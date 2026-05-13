"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import type { StoreApi } from "zustand";

import { createAuthStore } from "./authStore";
import type { AuthStore, AuthStoreInitialState } from "./types";

const AuthStoreContext = createContext<StoreApi<AuthStore> | null>(null);

interface AuthStoreProviderProps {
  children: ReactNode;
  initialState?: AuthStoreInitialState;
}

export function AuthStoreProvider({
  children,
  initialState,
}: AuthStoreProviderProps) {
  const storeRef = useRef<StoreApi<AuthStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAuthStore(initialState);
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStoreContext(): StoreApi<AuthStore> {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error(
      "useAuthStore must be used within an AuthStoreProvider.",
    );
  }

  return store;
}
