"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearChatHistory } from "../api/chat.api";
import type { ClearChatHistoryResponse } from "../types/chat.types";

interface UseClearChatHistoryOptions {
  onSuccess?: (data: ClearChatHistoryResponse, variables: string) => void;
  onError?: (error: ApiError, variables: string) => void;
  onSettled?: (
    data: ClearChatHistoryResponse | undefined,
    error: ApiError | null,
    variables: string,
  ) => void;
}

export function useClearChatHistory(options: UseClearChatHistoryOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<ClearChatHistoryResponse, ApiError, string>({
    mutationKey: [...queryKeys.chat.all, "clearHistory"] as const,
    mutationFn: clearChatHistory,
    onSuccess: (data, variables) => {
      void queryClient.removeQueries({
        queryKey: queryKeys.chat.history(variables),
      });
      void queryClient.removeQueries({
        queryKey: queryKeys.chat.history(data.data.session_id),
      });
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options.onSettled?.(data, error ?? null, variables);
    },
  });

  return {
    clearChatHistory: mutation.mutate,
    clearChatHistoryAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
