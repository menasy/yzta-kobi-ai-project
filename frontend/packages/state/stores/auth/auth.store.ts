"use client";

import { create } from "zustand";

/**
 * Auth Store — Zustand
 *
 * KURAL: Token asla bu store'da tutulmaz.
 * Auth süreci tamamen HttpOnly cookie üzerinden yürür.
 * Bu store yalnızca UI için kullanıcı bilgisini ve loading durumunu tutar.
 */

interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    // Yalnızca yerel UI state'i temizler
    // Cookie backend tarafından HttpOnly olarak set edilir/silinir
    set({ user: null });
  },
}));
