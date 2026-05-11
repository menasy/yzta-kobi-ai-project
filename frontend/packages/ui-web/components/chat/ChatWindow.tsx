"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@repo/core";
import {
  useChatActions,
  useChatSessionId,
  useIsTyping,
  useOptimisticMessages,
} from "@repo/state/stores/chat";
import { useSendMessage, useChatHistory } from "@repo/domain/chat";
import { useShowError } from "@repo/state/stores/message";
import type { ChatWindowProps } from "@repo/ui-contracts";
import type { ApiError } from "@repo/core";

import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow({ className }: ChatWindowProps) {
  const sessionId = useChatSessionId();
  const { ensureSessionId, addOptimisticMessage, replaceOptimisticMessage, appendAssistantMessage, setTyping, clearChat } = useChatActions();
  const optimisticMessages = useOptimisticMessages();
  const isTyping = useIsTyping();
  const showError = useShowError();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize session ID if not exists
  useEffect(() => {
    if (!sessionId) {
      ensureSessionId();
    }
  }, [sessionId, ensureSessionId]);

  const { history, isLoading } = useChatHistory(sessionId || "", {
    enabled: Boolean(sessionId),
  });

  const { sendMessageAsync } = useSendMessage({
    onError: (error: ApiError) => {
      showError("Hata", error.message || "Mesaj gönderilirken bir hata oluştu.");
      setTyping(false);
    },
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const currentSessionId = ensureSessionId();
    
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

      // Mark user message as no longer optimistic
      replaceOptimisticMessage(tempId, {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
        isOptimistic: false,
      });

      // Append assistant reply
      appendAssistantMessage({
        id: `ast-${Date.now()}`,
        content: response.data.reply,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      // Error is handled in onError
      console.error(err);
    } finally {
      setTyping(false);
    }
  };

  // Combine server history and client optimistic messages
  const serverMessages = history?.messages || [];
  // Use optimistic messages that are appended after the history was fetched, or if history is empty.
  // Given that history invalidates and refetches, we just show optimistic messages 
  // on top of server history if they are recent, but actually standard pattern is:
  // if server history exists, show it. The optimistic store might need to be cleared when history loads.
  // But for now, we'll append optimistic messages to the server history view.
  
  // Since we don't have a robust sync mechanism in chatStore for when history refetches, 
  // we'll rely on the server history and ONLY show optimistic messages if they are currently loading.
  // Actually, a simpler way: just show `optimisticMessages` if they exist, else `history.messages`.
  // If `optimisticMessages` is empty, it means we just loaded.
  
  // Wait, if user sends a message, it goes to optimisticMessages. 
  // Then history invalidates and refetches.
  // If we just concatenate them, it will duplicate.
  // Let's rely on server history + any messages currently in `optimisticMessages` that are `isOptimistic = true`.
  const displayedMessages = [
    ...serverMessages,
    ...optimisticMessages.filter(m => m.isOptimistic || m.role === 'assistant')
  ];

  // A better way to handle duplicate is just map by ID if possible, but our `serverMessages` don't have ID.
  // So we just show server messages + only optimistic messages that haven't been saved to server yet.
  const uniqueMessages = serverMessages.concat(
      optimisticMessages.filter(m => m.isOptimistic)
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-background relative",
        className
      )}
    >
      <ChatMessageList
        messages={uniqueMessages}
        isTyping={isTyping || isLoading}
        bottomRef={bottomRef}
      />
      <ChatInput
        onSendMessage={handleSendMessage}
        isPending={isTyping}
        disabled={isLoading && serverMessages.length === 0}
      />
    </div>
  );
}
