"use client";

import { useEffect, useRef } from "react";
import { cn } from "@repo/core";
import {
  useChatActions,
  useIsTyping,
  useOptimisticMessages,
} from "@repo/state/stores/chat";
import {
  getChatSendErrorReply,
  useChatHistory,
  useSendMessage,
} from "@repo/domain/chat";
import { useShowError } from "@repo/state/stores/message";
import type { ChatWindowProps } from "@repo/ui-contracts";
import type { ApiError } from "@repo/core";

import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ChatEmptyState } from "./ChatEmptyState";

export function ChatWindow({
  className,
  sessionId,
  onNewChat,
}: ChatWindowProps) {
  const {
    setSessionId,
    ensureSessionId,
    addOptimisticMessage,
    replaceOptimisticMessage,
    appendAssistantMessage,
    setTyping,
    clearMessages,
  } = useChatActions();
  const optimisticMessages = useOptimisticMessages();
  const isTyping = useIsTyping();
  const showError = useShowError();
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousSessionIdRef = useRef<string | null>(sessionId);

  useEffect(() => {
    const previousSessionId = previousSessionIdRef.current;

    setSessionId(sessionId);

    if (previousSessionId && previousSessionId !== sessionId) {
      clearMessages();
    }

    previousSessionIdRef.current = sessionId;
  }, [sessionId, setSessionId, clearMessages]);

  const { messages: serverMessages, isLoading } = useChatHistory(
    sessionId ?? "",
    {
      enabled: Boolean(sessionId),
    },
  );

  const { sendMessageAsync } = useSendMessage({
    onError: (error: ApiError) => {
      showError("Hata", error.message || "Mesaj gönderilirken bir hata oluştu.");
      setTyping(false);
    },
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const currentSessionId = sessionId ?? ensureSessionId();

    // Create optimistic user message
    const tempId = `temp-${Date.now()}`;
    addOptimisticMessage({
      id: tempId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    });

    setTyping(true);

    try {
      const response = await sendMessageAsync({
        session_id: currentSessionId,
        content,
      });

      replaceOptimisticMessage(tempId, {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        isOptimistic: false,
      });

      appendAssistantMessage({
        id: `ast-${Date.now()}`,
        content: response.data.reply,
        createdAt: new Date().toISOString(),
      });

      if (!sessionId && onNewChat) {
        onNewChat(currentSessionId);
      }
    } catch (error) {
      replaceOptimisticMessage(tempId, {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        isOptimistic: false,
      });
      appendAssistantMessage({
        id: `err-${Date.now()}`,
        content: getChatSendErrorReply(error),
        createdAt: new Date().toISOString(),
      });
    } finally {
      setTyping(false);
    }
  };

  const displayedMessages =
    serverMessages.length > 0
      ? [
          ...serverMessages,
          ...optimisticMessages.filter(
            (optimisticMessage) =>
              optimisticMessage.id !== "welcome-message" &&
              !serverMessages.some(
                (serverMessage) =>
                  serverMessage.content === optimisticMessage.content &&
                  serverMessage.role === optimisticMessage.role,
              ),
          ),
        ]
      : optimisticMessages;

  // If no sessionId and no messages (not even the welcome message), show the empty state.
  if (!sessionId && displayedMessages.length === 0) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden bg-background",
          className,
        )}
      >
        <ChatEmptyState onNewChat={() => onNewChat?.("")} />
        <ChatInput
          onSendMessage={handleSendMessage}
          isPending={isTyping}
          disabled={isTyping}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-background",
        className,
      )}
    >
      <ChatMessageList
        messages={displayedMessages}
        isTyping={isTyping || isLoading}
        bottomRef={bottomRef}
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        isPending={isTyping}
        disabled={(isLoading && serverMessages.length === 0) || isTyping}
      />
    </div>
  );
}
