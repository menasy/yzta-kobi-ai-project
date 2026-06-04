"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";

import { createQueryClient } from "./client";

type ReactQueryDevtoolsComponent = ComponentType<{
  initialIsOpen?: boolean;
}>;

interface ReactQueryDevtoolsModule {
  ReactQueryDevtools: ReactQueryDevtoolsComponent;
}

interface QueryProviderProps {
  children: ReactNode;
}

function isReactQueryDevtoolsModule(
  value: unknown,
): value is ReactQueryDevtoolsModule {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const moduleRecord = value as Record<string, unknown>;
  return typeof moduleRecord.ReactQueryDevtools === "function";
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => createQueryClient());
  const [ReactQueryDevtools, setReactQueryDevtools] =
    useState<ReactQueryDevtoolsComponent | null>(null);

  useEffect(() => {
    let isMounted = true;

    const showDevtools =
      process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true" ||
      (process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS !== "false" &&
        process.env.NODE_ENV === "development");

    if (showDevtools) {
      void (
        // @ts-expect-error App package provides this optional dev-only dependency.
        import("@tanstack/react-query-devtools") as Promise<unknown>
      ).then((module) => {
        if (isMounted && isReactQueryDevtoolsModule(module)) {
          setReactQueryDevtools(() => module.ReactQueryDevtools);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
