"use client";

import type { AiAssistantMessageListProps } from "@repo/ui-contracts";

import { ChatMessageList } from "../chat/ChatMessageList";
import { AiAssistantEmptyState } from "./AiAssistantEmptyState";

export function AiAssistantMessageList({
  messages,
  isTyping,
  bottomRef,
}: AiAssistantMessageListProps) {
  if (messages.length === 0 && !isTyping) {
    return <AiAssistantEmptyState />;
  }

  return (
    <ChatMessageList
      messages={messages}
      isTyping={isTyping}
      bottomRef={bottomRef}
      surface="panel"
    />
  );
}
