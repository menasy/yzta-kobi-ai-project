"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getChatConversation } from "../api/chat.api";
import type { ChatConversationDetailResponse } from "../types/chat.types";

interface UseChatConversationOptions {
  enabled?: boolean;
}

export function useChatConversation(
  sessionId: string | null,
  options: UseChatConversationOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled =
    systemReady &&
    Boolean(sessionId) &&
    sessionId !== "[object Object]" &&
    (options.enabled ?? true);

  const query = useQuery<ChatConversationDetailResponse, ApiError>({
    queryKey: queryKeys.chat.conversation(sessionId ?? ""),
    queryFn: () => getChatConversation(sessionId!),
    enabled,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  return {
    conversation: query.data?.data?.conversation ?? null,
    messages: query.data?.data?.messages ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
