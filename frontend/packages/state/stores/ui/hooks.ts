"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useUIStoreContext } from "./provider";
import type { UIActions, UIStore } from "./types";

type UISelector<T> = (state: UIStore) => T;

const selectSidebarCollapsed = (state: UIStore) => state.sidebarCollapsed;
const selectMobileSidebarOpen = (state: UIStore) => state.mobileSidebarOpen;
const selectCommandMenuOpen = (state: UIStore) => state.commandMenuOpen;
const selectGlobalLoading = (state: UIStore) => state.globalLoading;
const selectAiPanelOpen = (state: UIStore) => state.aiPanelOpen;

export function useUIStore<T>(selector: UISelector<T>): T {
  const store = useUIStoreContext();

  return useStore(store, selector);
}

export function useSidebarCollapsed(): boolean {
  return useUIStore(selectSidebarCollapsed);
}

export function useMobileSidebarOpen(): boolean {
  return useUIStore(selectMobileSidebarOpen);
}

export function useCommandMenuOpen(): boolean {
  return useUIStore(selectCommandMenuOpen);
}

export function useGlobalLoading(): boolean {
  return useUIStore(selectGlobalLoading);
}

export function useAiPanelOpen(): boolean {
  return useUIStore(selectAiPanelOpen);
}

export function useUIActions(): UIActions {
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);
  const setCommandMenuOpen = useUIStore((state) => state.setCommandMenuOpen);
  const setGlobalLoading = useUIStore((state) => state.setGlobalLoading);
  const setAiPanelOpen = useUIStore((state) => state.setAiPanelOpen);
  const toggleAiPanel = useUIStore((state) => state.toggleAiPanel);

  return useMemo(
    () => ({
      setSidebarCollapsed,
      toggleSidebar,
      setMobileSidebarOpen,
      setCommandMenuOpen,
      setGlobalLoading,
      setAiPanelOpen,
      toggleAiPanel,
    }),
    [
      setCommandMenuOpen,
      setGlobalLoading,
      setMobileSidebarOpen,
      setSidebarCollapsed,
      toggleSidebar,
      setAiPanelOpen,
      toggleAiPanel,
    ],
  );
}
