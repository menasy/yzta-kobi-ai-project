"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getChatConversations } from "../api/chat.api";
import type { ChatConversationsResponse } from "../types/chat.types";

interface UseChatConversationsOptions {
  enabled?: boolean;
}

export function useChatConversations(
  options: UseChatConversationsOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? true);

  const query = useQuery<ChatConversationsResponse, ApiError>({
    queryKey: queryKeys.chat.conversations(),
    queryFn: getChatConversations,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    conversations: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error ?? null,
  } as const;
}
