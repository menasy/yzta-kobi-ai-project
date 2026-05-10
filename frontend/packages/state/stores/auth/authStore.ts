import { createStore } from "zustand/vanilla";

import type { AuthStore, AuthStoreInitialState } from "./types";

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isSessionLoading: false,
} satisfies AuthStoreInitialState;

export const createAuthStore = (
  initialState: AuthStoreInitialState = {},
) =>
  createStore<AuthStore>()((set, get) => ({
    ...defaultAuthState,
    ...initialState,
    setAuth: (user) =>
      set({
        user,
        isAuthenticated: Boolean(user),
        isSessionLoading: false,
      }),
    setUser: (user) =>
      set({
        user,
        isAuthenticated: Boolean(user),
      }),
    updateUser: (partialUser) =>
      set((state) => {
        if (!state.user) {
          return state;
        }

        return {
          user: {
            ...state.user,
            ...partialUser,
          },
          isAuthenticated: true,
        };
      }),
    clearAuth: () =>
      set({
        user: null,
        isAuthenticated: false,
        isSessionLoading: false,
      }),
    setSessionLoading: (isLoading) => set({ isSessionLoading: isLoading }),
    isAdmin: () => get().user?.role === "admin",
  }));
