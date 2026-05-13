"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createChatConversation } from "../api/chat.api";
import type {
  CreateConversationRequest,
  CreateConversationResponse,
} from "../types/chat.types";

interface UseCreateChatConversationOptions {
  onSuccess?: (data: CreateConversationResponse) => void;
  onError?: (error: ApiError) => void;
}

export function useCreateChatConversation(
  options: UseCreateChatConversationOptions = {},
) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CreateConversationResponse,
    ApiError,
    CreateConversationRequest | undefined
  >({
    mutationKey: [...queryKeys.chat.all, "createConversation"] as const,
    mutationFn: (data) => createChatConversation(data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
      });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  return {
    createConversation: mutation.mutate,
    createConversationAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
