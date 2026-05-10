"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useQuery } from "@tanstack/react-query";

import { getChatHistory } from "../api/chat.api";
import type { ChatHistoryResponse } from "../types/chat.types";

interface UseChatHistoryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  sessionId?: string;
}

export function useChatHistory(options: UseChatHistoryOptions = {}) {
  const query = useQuery<ChatHistoryResponse, ApiError>({
    queryKey: queryKeys.chat.history(options.sessionId),
    queryFn: getChatHistory,
    enabled: options.enabled,
    refetchInterval: options.refetchInterval,
  });

  return {
    messages: query.data?.data ?? [],
    data: query.data,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isSuccess: query.isSuccess,
    error: query.error ?? null,
  } as const;
}
