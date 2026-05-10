"use client";

import { create } from "zustand";

/**
 * UI Store — Zustand
 *
 * Sidebar, global loading gibi UI state'i.
 * API verisi veya auth bilgisi içermez.
 */

interface UIState {
  sidebarOpen: boolean;
  globalLoading: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  globalLoading: false,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
