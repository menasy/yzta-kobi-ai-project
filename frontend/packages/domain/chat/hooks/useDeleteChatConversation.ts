"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteChatConversation } from "../api/chat.api";
import type { DeleteConversationResponse } from "../types/chat.types";

interface UseDeleteChatConversationOptions {
  onSuccess?: (data: DeleteConversationResponse, sessionId: string) => void;
  onError?: (error: ApiError, sessionId: string) => void;
}

export function useDeleteChatConversation(
  options: UseDeleteChatConversationOptions = {},
) {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteConversationResponse, ApiError, string>({
    mutationKey: [...queryKeys.chat.all, "deleteConversation"] as const,
    mutationFn: deleteChatConversation,
    onSuccess: (data, sessionId) => {
      // Conversation listesini yenile
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
      });
      // Silinen conversation cache'ini temizle
      void queryClient.removeQueries({
        queryKey: queryKeys.chat.conversation(sessionId),
      });
      // History cache'ini de temizle
      void queryClient.removeQueries({
        queryKey: queryKeys.chat.history(sessionId),
      });
      options.onSuccess?.(data, sessionId);
    },
    onError: (error, sessionId) => {
      options.onError?.(error, sessionId);
    },
  });

  return {
    deleteConversation: mutation.mutate,
    deleteConversationAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
