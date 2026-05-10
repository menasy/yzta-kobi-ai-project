"use client";

import {
  AuthStoreProvider,
  ChatStoreProvider,
  QueryProvider,
  UIStoreProvider,
} from "@repo/state";
import type { ReactNode } from "react";

import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthStoreProvider>
          <UIStoreProvider>
            <ChatStoreProvider>{children}</ChatStoreProvider>
          </UIStoreProvider>
        </AuthStoreProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
