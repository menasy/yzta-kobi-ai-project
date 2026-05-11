"use client";

import {
  AuthStoreProvider,
  ChatStoreProvider,
  MessageStoreProvider,
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
            <MessageStoreProvider>
              <ChatStoreProvider>{children}</ChatStoreProvider>
            </MessageStoreProvider>
          </UIStoreProvider>
        </AuthStoreProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
