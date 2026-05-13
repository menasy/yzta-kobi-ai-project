"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ApiError } from "@repo/core";
import { useShowError } from "@repo/state/stores/message";
import {
  useChatActions,
  useIsTyping,
  useOptimisticMessages,
} from "@repo/state/stores/chat";
import { useQueryClient } from "@tanstack/react-query";

import { invalidateAiActionQueries } from "../../ai-actions/utils/invalidate-ai-action-queries";
import { useChatConversation } from "./useChatConversation";
import { useClearChatHistory } from "./useClearChatHistory";
import { useSendMessage } from "./useSendMessage";
import { getChatSendErrorReply } from "../utils/chat-error";
import { extractStructuredSendMessageMetadata } from "../utils/extract-structured-chat-metadata";
import { mergeChatMessages } from "../utils/merge-chat-messages";
import { normalizeConversationMessages } from "../utils/normalize-chat-messages";

interface UseChatControllerOptions {
  sessionId: string | null;
  enabled?: boolean;
  clearOnSessionChange?: boolean;
  onSessionReady?: (sessionId: string) => void;
}

export function useChatController({
  sessionId,
  enabled = true,
  clearOnSessionChange = false,
  onSessionReady,
}: UseChatControllerOptions) {
  const queryClient = useQueryClient();
  const showError = useShowError();
  const previousSessionIdRef = useRef<string | null>(sessionId);
  const {
    setSessionId,
    ensureSessionId,
    addOptimisticMessage,
    replaceOptimisticMessage,
    appendAssistantMessage,
    setTyping,
    clearMessages,
    clearChat,
  } = useChatActions();
  const optimisticMessages = useOptimisticMessages();
  const isTyping = useIsTyping();

  useEffect(() => {
    const previousSessionId = previousSessionIdRef.current;

    setSessionId(sessionId);

    if (
      clearOnSessionChange &&
      previousSessionId &&
      previousSessionId !== sessionId
    ) {
      clearMessages();
    }

    previousSessionIdRef.current = sessionId;
  }, [clearMessages, clearOnSessionChange, sessionId, setSessionId]);

  const {
    messages: conversationMessages,
    conversation,
    isLoading,
    error,
    refetch,
  } = useChatConversation(sessionId, {
    enabled: enabled && Boolean(sessionId),
  });

  const normalizedServerMessages = useMemo(
    () => normalizeConversationMessages(conversationMessages),
    [conversationMessages],
  );
  const hasLocalConversationActivity = useMemo(
    () =>
      optimisticMessages.some((message) => message.id !== "welcome-message"),
    [optimisticMessages],
  );
  const visibleError =
    error?.isNotFound && hasLocalConversationActivity ? null : error;

  const displayedMessages = useMemo(
    () => mergeChatMessages(normalizedServerMessages, optimisticMessages),
    [normalizedServerMessages, optimisticMessages],
  );

  const { sendMessageAsync } = useSendMessage({
    onError: (mutationError: ApiError) => {
      showError(
        "Hata",
        mutationError.message || "Mesaj gönderilirken bir hata oluştu.",
      );
      setTyping(false);
    },
  });

  const { clearChatHistoryAsync, isPending: isClearPending } =
    useClearChatHistory();

  const sendTextMessage = useCallback(
    async (content: string) => {
      const normalizedContent = content.trim();
      if (!normalizedContent || isTyping) {
        return null;
      }

      const activeSessionId = sessionId ?? ensureSessionId();
      const optimisticUserMessageId = `usr-${Date.now()}`;

      addOptimisticMessage({
        id: optimisticUserMessageId,
        role: "user",
        content: normalizedContent,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      });

      setTyping(true);

      try {
        const response = await sendMessageAsync({
          session_id: activeSessionId,
          content: normalizedContent,
        });

        const metadata = extractStructuredSendMessageMetadata(response.data);

        replaceOptimisticMessage(optimisticUserMessageId, {
          id: optimisticUserMessageId,
          role: "user",
          content: normalizedContent,
          createdAt: new Date().toISOString(),
          isOptimistic: false,
        });

        appendAssistantMessage({
          id: `ast-${Date.now()}`,
          content: response.data.reply,
          createdAt: new Date().toISOString(),
          pendingAction: metadata.pendingAction,
          actionExecution: metadata.actionExecution,
        });

        if (metadata.actionExecution) {
          await invalidateAiActionQueries(
            queryClient,
            metadata.actionExecution.actionType,
          );
        }

        if (!sessionId) {
          onSessionReady?.(activeSessionId);
        }

        return response;
      } catch (sendError) {
        replaceOptimisticMessage(optimisticUserMessageId, {
          id: optimisticUserMessageId,
          role: "user",
          content: normalizedContent,
          createdAt: new Date().toISOString(),
          isOptimistic: false,
        });
        appendAssistantMessage({
          id: `err-${Date.now()}`,
          content: getChatSendErrorReply(sendError),
          createdAt: new Date().toISOString(),
        });
        throw sendError;
      } finally {
        setTyping(false);
      }
    },
    [
      addOptimisticMessage,
      appendAssistantMessage,
      ensureSessionId,
      isTyping,
      onSessionReady,
      queryClient,
      replaceOptimisticMessage,
      sendMessageAsync,
      sessionId,
      setTyping,
    ],
  );

  const clearConversation = useCallback(async () => {
    if (!sessionId) {
      clearChat();
      return;
    }

    try {
      await clearChatHistoryAsync(sessionId);
      clearChat();
    } catch (clearError) {
      const clearMessage =
        clearError instanceof Error
          ? clearError.message
          : "Konuşma temizlenirken bir hata oluştu.";
      showError("Hata", clearMessage);
      throw clearError;
    }
  }, [clearChat, clearChatHistoryAsync, sessionId, showError]);

  return {
    conversation,
    displayedMessages,
    serverMessages: normalizedServerMessages,
    sendTextMessage,
    clearConversation,
    isTyping,
    isLoading,
    isClearPending,
    error: visibleError,
    refetch,
  } as const;
}
