import { createStore } from "zustand/vanilla";

import type { AuthStore, AuthStoreInitialState } from "./types";

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isSessionLoading: true,
} satisfies AuthStoreInitialState;

export const createAuthStore = (initialState: AuthStoreInitialState = {}) =>
  createStore<AuthStore>()((set, get) => ({
    ...defaultAuthState,
    ...initialState,
    setAuth: (user) =>
      set({
        user,
        isAuthenticated: !!user,
        isSessionLoading: false,
      }),
    setUser: (user) =>
      set({
        user,
        isAuthenticated: !!user,
      }),
    updateUser: (partialUser) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...partialUser } : null,
      })),
    clearAuth: () =>
      set({
        user: null,
        isAuthenticated: false,
        isSessionLoading: false,
      }),
    setSessionLoading: (isLoading) => set({ isSessionLoading: isLoading }),
    isAdmin: () => get().user?.role === "admin",
  }));
