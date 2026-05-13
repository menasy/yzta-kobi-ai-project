"use client";

import { useMemo } from "react";
import { useStore } from "zustand";

import { useSystemStoreContext } from "./provider";
import type { SystemActions, SystemState, SystemStore, SystemStatusData } from "./types";

type SystemSelector<T> = (state: SystemStore) => T;

const selectStatus = (state: SystemStore) => state.status;
const selectReady = (state: SystemStore) => state.status?.ready ?? false;
const selectChecking = (state: SystemStore) => state.isChecking;
const selectError = (state: SystemStore) => state.error;
const selectLastCheckedAt = (state: SystemStore) => state.lastCheckedAt;

export function useSystemStore<T>(selector: SystemSelector<T>): T {
  const store = useSystemStoreContext();

  return useStore(store, selector);
}

export function useSystemStatus(): SystemStatusData | null {
  return useSystemStore(selectStatus);
}

export function useSystemReady(): boolean {
  return useSystemStore(selectReady);
}

export function useSystemChecking(): boolean {
  return useSystemStore(selectChecking);
}

export function useSystemError(): SystemState["error"] {
  return useSystemStore(selectError);
}

export function useSystemLastCheckedAt(): string | null {
  return useSystemStore(selectLastCheckedAt);
}

export function useSystemActions(): SystemActions {
  const setStatus = useSystemStore((state) => state.setStatus);
  const setChecking = useSystemStore((state) => state.setChecking);
  const setError = useSystemStore((state) => state.setError);
  const resetStatus = useSystemStore((state) => state.resetStatus);

  return useMemo(
    () => ({
      setStatus,
      setChecking,
      setError,
      resetStatus,
    }),
    [resetStatus, setChecking, setError, setStatus],
  );
}
