"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@repo/core";
import {
  useChatActions,
  useIsTyping,
  useOptimisticMessages,
} from "@repo/state/stores/chat";
import { useSendMessage, useChatConversation } from "@repo/domain/chat";
import { useShowError } from "@repo/state/stores/message";
import type { ChatWindowProps } from "@repo/ui-contracts";
import type { ApiError } from "@repo/core";
import type { ChatConversationMessage } from "@repo/domain/chat";
import type { OptimisticChatMessage } from "@repo/state/stores/chat/types";

import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ChatEmptyState } from "./ChatEmptyState";

export function ChatWindow({ className, sessionId, onNewChat }: ChatWindowProps) {
  const { 
    setSessionId, 
    ensureSessionId, 
    addOptimisticMessage, 
    removeMessage,
    replaceOptimisticMessage, 
    appendAssistantMessage, 
    setTyping, 
    clearMessages 
  } = useChatActions();
  const optimisticMessages = useOptimisticMessages();
  const isTyping = useIsTyping();
  const showError = useShowError();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync prop sessionId to the chat store and clear optimistic state when switching
  useEffect(() => {
    setSessionId(sessionId);
    clearMessages();
  }, [sessionId, setSessionId, clearMessages]);

  // Load conversation and messages from PostgreSQL
  const { messages: serverMessages, isLoading } = useChatConversation(sessionId, {
    enabled: Boolean(sessionId),
  });

  const { sendMessageAsync } = useSendMessage({
    onError: (error: ApiError) => {
      showError("Hata", error.message || "Mesaj gönderilirken bir hata oluştu.");
      setTyping(false);
    },
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    // Use existing sessionId or generate a new one for optimistic flow
    const currentSessionId = sessionId || ensureSessionId();
    
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

      // Once we have a successful response, we can remove the optimistic message
      // as the subsequent refetch will bring it from the server history.
      removeMessage(tempId);

      // Append assistant reply to local store ONLY if it's not already expected from server refetch
      // Actually, appending it is fine for instant feedback, but we should make sure displayedMessages deduplicates it.
      appendAssistantMessage({
        id: `ast-${Date.now()}`,
        content: response.data.reply,
        createdAt: new Date().toISOString(),
      });
      
      // If this was a new chat, notify parent to update URL
      if (!sessionId && onNewChat) {
        onNewChat(currentSessionId);
      }
    } catch (err) {
      console.error(err);
      // In case of error, we might want to mark the message as failed or just remove it
      removeMessage(tempId);
    } finally {
      setTyping(false);
    }
  };

  // Combine server history and client optimistic messages
  // We deduplicate messages by content if they are very close in time, 
  // or simply prioritize server messages once they arrive.
  const displayedMessages = serverMessages.length > 0
    ? [
        ...serverMessages,
        ...optimisticMessages.filter(
          (om) => 
            om.id !== "welcome-message" && 
            // Show if it's an optimistic user message OR an assistant reply not yet in server history
            !serverMessages.some(sm => sm.content === om.content && sm.role === om.role)
        )
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
