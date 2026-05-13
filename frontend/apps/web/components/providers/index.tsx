"use client";

import {
  AuthStoreProvider,
  ChatStoreProvider,
  MessageStoreProvider,
  QueryProvider,
  UIStoreProvider,
} from "@repo/state";
import type { AuthStoreInitialState } from "@repo/state";
import type { ReactNode } from "react";

import { AuthSessionSync } from "../auth/AuthSessionSync";

import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: ReactNode;
  authInitialState?: AuthStoreInitialState;
  hasAuthCookie?: boolean;
}

export function Providers({
  children,
  authInitialState,
  hasAuthCookie = false,
}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthStoreProvider initialState={authInitialState}>
          <AuthSessionSync hasAuthCookie={hasAuthCookie} />
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
