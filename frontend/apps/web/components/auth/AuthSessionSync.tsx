"use client";

import { handleUnauthorized } from "@repo/core";
import { useMe } from "@repo/domain/auth";
import { useAuthActions } from "@repo/state/stores/auth";
import { useEffect } from "react";

interface AuthSessionSyncProps {
  hasAuthCookie: boolean;
}

export function AuthSessionSync({ hasAuthCookie }: AuthSessionSyncProps) {
  const { clearAuth, setAuth, setSessionLoading } = useAuthActions();

  useMe({
    enabled: hasAuthCookie,
    onSuccess: (response) => {
      setAuth(response.data);
    },
    onError: (error) => {
      clearAuth();
      handleUnauthorized(error);
    },
    onSettled: () => {
      setSessionLoading(false);
    },
  });

  useEffect(() => {
    if (!hasAuthCookie) {
      clearAuth();
    }
  }, [clearAuth, hasAuthCookie]);

  return null;
}
