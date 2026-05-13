"use client";

import {
  AuthStoreProvider,
  ChatStoreProvider,
  MessageStoreProvider,
  QueryProvider,
  SystemStoreProvider,
  UIStoreProvider,
} from "@repo/state";
import type { AuthStoreInitialState } from "@repo/state";
import type { ReactNode } from "react";

import { AuthSessionSync } from "../auth/AuthSessionSync";
import { SystemGate, SystemStatusSync } from "../system";

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
        <SystemStoreProvider>
          <SystemStatusSync />
          <AuthStoreProvider initialState={authInitialState}>
            <AuthSessionSync hasAuthCookie={hasAuthCookie} />
            <UIStoreProvider>
              <MessageStoreProvider>
                <ChatStoreProvider>
                  <SystemGate>{children}</SystemGate>
                </ChatStoreProvider>
              </MessageStoreProvider>
            </UIStoreProvider>
          </AuthStoreProvider>
        </SystemStoreProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
