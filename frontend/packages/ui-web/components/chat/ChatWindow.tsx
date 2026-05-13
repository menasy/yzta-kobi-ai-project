"use client";

import { cn } from "@repo/core";
import { useRef } from "react";
import { useChatController } from "@repo/domain/chat";
import type { ChatWindowProps } from "@repo/ui-contracts";

import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ChatEmptyState } from "./ChatEmptyState";

export function ChatWindow({
  className,
  sessionId,
  onNewChat,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    displayedMessages,
    sendTextMessage,
    isTyping,
    isLoading,
  } = useChatController({
    sessionId,
    clearOnSessionChange: true,
    onSessionReady: (createdSessionId) => {
      onNewChat?.(createdSessionId);
    },
  });

  const hasOnlyWelcomeMessage =
    displayedMessages.length === 1 && displayedMessages[0]?.id === "welcome-message";

  if (!sessionId && hasOnlyWelcomeMessage) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden bg-background",
          className,
        )}
      >
        <ChatEmptyState onNewChat={() => onNewChat?.("")} />
        <ChatInput
          onSendMessage={(content) => {
            void sendTextMessage(content);
          }}
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
        onActionMessage={sendTextMessage}
      />
      <ChatInput
        onSendMessage={(content) => {
          void sendTextMessage(content);
        }}
        isPending={isTyping}
        disabled={isTyping || (isLoading && !sessionId)}
      />
    </div>
  );
}
