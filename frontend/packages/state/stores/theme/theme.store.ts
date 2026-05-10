"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Theme Store — Zustand + persist middleware
 *
 * next-themes ile entegre — tema değişimi buradan tetiklenir.
 * localStorage'a persist edilir.
 */

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "kobi-ai-theme",
    },
  ),
);
