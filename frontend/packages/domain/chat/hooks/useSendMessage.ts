"use client";

import type { ApiError } from "@repo/core";
import { queryKeys } from "@repo/state/query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendMessage } from "../api/chat.api";
import type {
  SendMessageRequest,
  SendMessageResponse,
} from "../types/chat.types";

interface UseSendMessageOptions {
  onSuccess?: (data: SendMessageResponse, variables: SendMessageRequest) => void;
  onError?: (error: ApiError, variables: SendMessageRequest) => void;
  onSettled?: (
    data: SendMessageResponse | undefined,
    error: ApiError | null,
    variables: SendMessageRequest,
  ) => void;
}

export function useSendMessage(options: UseSendMessageOptions = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<SendMessageResponse, ApiError, SendMessageRequest>(
    {
      mutationKey: [...queryKeys.chat.all, "message"] as const,
      mutationFn: sendMessage,
      onSuccess: (data, variables) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.chat.history(data.data.session_id),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.chat.history(variables.session_id),
        });
        options.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        options.onError?.(error, variables);
      },
      onSettled: (data, error, variables) => {
        options.onSettled?.(data, error ?? null, variables);
      },
    },
  );

  return {
    sendMessage: mutation.mutate,
    sendMessageAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error ?? null,
    reset: mutation.reset,
  } as const;
}
