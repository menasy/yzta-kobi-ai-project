"use client";

import {
  useIsAuthenticated,
  useIsSessionLoading,
  useUser,
} from "@repo/state/stores/auth";
import {
  useChatActions,
  useChatSessionId,
} from "@repo/state/stores/chat";
import { useEffect, useMemo } from "react";

const STORAGE_KEY_PREFIX = "kobiai:active-chat-session";
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/;

function normalizeSessionId(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (!SESSION_ID_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

function getRouteChatSessionId(): string | null {
  if (window.location.pathname !== "/chat") {
    return null;
  }

  return normalizeSessionId(new URLSearchParams(window.location.search).get("s"));
}

export function ChatSessionPersistence() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isSessionLoading = useIsSessionLoading();
  const sessionId = useChatSessionId();
  const { clearChat, setSessionId } = useChatActions();

  const storageKey = useMemo(() => {
    if (!user) {
      return null;
    }

    return `${STORAGE_KEY_PREFIX}:${user.id}`;
  }, [user]);

  useEffect(() => {
    if (!storageKey || sessionId || getRouteChatSessionId()) {
      return;
    }

    const storedSessionId = normalizeSessionId(
      window.localStorage.getItem(storageKey),
    );

    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, [sessionId, setSessionId, storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    if (sessionId) {
      window.localStorage.setItem(storageKey, sessionId);
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [sessionId, storageKey]);

  useEffect(() => {
    if (isSessionLoading || isAuthenticated) {
      return;
    }

    clearChat();
  }, [clearChat, isAuthenticated, isSessionLoading]);

  return null;
}
