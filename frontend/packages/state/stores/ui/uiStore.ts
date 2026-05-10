import { createStore } from "zustand/vanilla";

import type { UIStore, UIStoreInitialState } from "./types";

const defaultUIState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  commandMenuOpen: false,
  globalLoading: false,
} satisfies UIStoreInitialState;

export const createUIStore = (initialState: UIStoreInitialState = {}) =>
  createStore<UIStore>()((set) => ({
    ...defaultUIState,
    ...initialState,
    setSidebarCollapsed: (isCollapsed) =>
      set({ sidebarCollapsed: isCollapsed }),
    toggleSidebar: () =>
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setMobileSidebarOpen: (isOpen) => set({ mobileSidebarOpen: isOpen }),
    setCommandMenuOpen: (isOpen) => set({ commandMenuOpen: isOpen }),
    setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),
  }));
