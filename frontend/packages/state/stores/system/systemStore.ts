import { createStore } from "zustand/vanilla";

import type { SystemStore, SystemStoreInitialState } from "./types";

const defaultSystemState = {
  status: null,
  isChecking: false,
  lastCheckedAt: null,
  error: null,
} satisfies SystemStoreInitialState;

export const createSystemStore = (
  initialState: SystemStoreInitialState = {},
) =>
  createStore<SystemStore>()((set) => ({
    ...defaultSystemState,
    ...initialState,
    setStatus: (status) =>
      set({
        status,
        isChecking: false,
        lastCheckedAt: new Date().toISOString(),
        error: null,
      }),
    setChecking: (isChecking) => set({ isChecking }),
    setError: (error) =>
      set({
        error,
        isChecking: false,
        lastCheckedAt: new Date().toISOString(),
      }),
    resetStatus: () => set({ ...defaultSystemState }),
  }));
