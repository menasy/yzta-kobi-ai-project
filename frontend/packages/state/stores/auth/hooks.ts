"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useAuthStoreContext } from "./provider";
import type { AuthActions, AuthStore, AuthUser } from "./types";

type AuthSelector<T> = (state: AuthStore) => T;

const selectUser = (state: AuthStore) => state.user;
const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
const selectIsSessionLoading = (state: AuthStore) => state.isSessionLoading;
const selectIsAdmin = (state: AuthStore) => state.user?.role === "admin";

export function useAuthStore<T>(selector: AuthSelector<T>): T {
  const store = useAuthStoreContext();

  return useStore(store, selector);
}

export function useUser(): AuthUser | null {
  return useAuthStore(selectUser);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}

export function useIsSessionLoading(): boolean {
  return useAuthStore(selectIsSessionLoading);
}

export function useIsAdmin(): boolean {
  return useAuthStore(selectIsAdmin);
}

export function useAuthActions(): AuthActions {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setSessionLoading = useAuthStore((state) => state.setSessionLoading);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return useMemo(
    () => ({
      setAuth,
      setUser,
      updateUser,
      clearAuth,
      setSessionLoading,
      isAdmin,
    }),
    [
      clearAuth,
      isAdmin,
      setAuth,
      setSessionLoading,
      setUser,
      updateUser,
    ],
  );
}
