"use client";

import type { ApiError } from "@repo/core";
import { useSystemReady } from "@repo/state";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getChatHistory } from "../api/chat.api";
import type { ChatHistoryResponse } from "../types/chat.types";

interface UseChatHistoryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useChatHistory(
  sessionId: string,
  options: UseChatHistoryOptions = {},
) {
  const systemReady = useSystemReady();
  const enabled = systemReady && (options.enabled ?? Boolean(sessionId));
  const refetchInterval = systemReady ? options.refetchInterval : false;

  const query = useQuery<ChatHistoryResponse, ApiError>({
    queryKey: queryKeys.chat.history(sessionId),
    queryFn: () => getChatHistory(sessionId),
    enabled,
    refetchInterval,
  });

  return {
    history: query.data?.data ?? null,
    messages: query.data?.data.messages ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
