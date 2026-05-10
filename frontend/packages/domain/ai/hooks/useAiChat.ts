"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation } from "@tanstack/react-query";

import { sendAiChatMessage } from "../api/ai.api";
import type {
  AiChatRequest,
  AiChatResponse,
} from "../types/ai.types";

interface UseAiChatOptions {
  onSuccess?: (data: AiChatResponse, variables: AiChatRequest) => void;
  onError?: (error: ApiError, variables: AiChatRequest) => void;
  onSettled?: (
    data: AiChatResponse | undefined,
    error: ApiError | null,
    variables: AiChatRequest,
  ) => void;
}

export function useAiChat(options: UseAiChatOptions = {}) {
  const mutation = useMutation<AiChatResponse, ApiError, AiChatRequest>({
    mutationKey: [...queryKeys.ai.all, "chat"] as const,
    mutationFn: sendAiChatMessage,
    onSuccess: (data, variables) => {
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
    sendAiChatMessage: mutation.mutate,
    sendAiChatMessageAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
