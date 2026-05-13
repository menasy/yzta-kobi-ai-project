"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { ApiError } from "@repo/core";
import { useMe, useRefresh } from "@repo/domain/auth";
import { isProtectedPath } from "@repo/domain/auth/access/policy";
import { useAuthActions } from "@repo/state/stores/auth";

interface AuthSessionSyncProps {
  hasAuthCookie: boolean;
}

export function AuthSessionSync({ hasAuthCookie }: AuthSessionSyncProps) {
  const { clearAuth, setAuth, setSessionLoading } = useAuthActions();
  const pathname = usePathname();
  const router = useRouter();
  const refreshAttemptedRef = useRef(false);

  const meQuery = useMe({
    enabled: hasAuthCookie,
  });
  const { refreshAsync } = useRefresh();
  
  // Use a ref for meQuery to avoid stale closure in recoverSession callback
  const meQueryRef = useRef(meQuery);
  meQueryRef.current = meQuery;

  // Use stable references for callbacks called inside useEffect to avoid unnecessary re-runs
  // This is a polyfill for the experimental useEffectEvent hook
  const finalizeAnonymousSessionRef = useRef(() => {});
  finalizeAnonymousSessionRef.current = () => {
    clearAuth();
    setSessionLoading(false);

    if (isProtectedPath(pathname)) {
      const loginPath = pathname ? `/auth/login?from=${encodeURIComponent(pathname)}` : "/auth/login";
      router.replace(loginPath);
      router.refresh();
    }
  };
  const finalizeAnonymousSession = useCallback(() => finalizeAnonymousSessionRef.current(), []);

  const recoverSessionRef = useRef(async (_error: ApiError) => {});
  recoverSessionRef.current = async (error: ApiError) => {
    if (!error.isUnauthorized) {
      finalizeAnonymousSession();
      return;
    }

    if (refreshAttemptedRef.current) {
      finalizeAnonymousSession();
      return;
    }

    refreshAttemptedRef.current = true;
    setSessionLoading(true);

    try {
      await refreshAsync();
      await meQueryRef.current.refetch();
    } catch {
      finalizeAnonymousSession();
    } finally {
      setSessionLoading(false);
    }
  };
  const recoverSession = useCallback((error: ApiError) => recoverSessionRef.current(error), [finalizeAnonymousSession]);

  useEffect(() => {
    if (!hasAuthCookie) {
      refreshAttemptedRef.current = false;
      finalizeAnonymousSession();
    }
  }, [finalizeAnonymousSession, hasAuthCookie]);

  useEffect(() => {
    if (meQuery.user) {
      refreshAttemptedRef.current = false;
      setAuth(meQuery.user);
      setSessionLoading(false);
    }
  }, [meQuery.user, setAuth, setSessionLoading]);

  useEffect(() => {
    if (meQuery.error) {
      void recoverSession(meQuery.error);
    }
  }, [meQuery.error, recoverSession]);

  useEffect(() => {
    if (!hasAuthCookie) {
      return;
    }

    setSessionLoading(meQuery.isLoading || meQuery.isPending);
  }, [hasAuthCookie, meQuery.isLoading, meQuery.isPending, setSessionLoading]);

  return null;
}
