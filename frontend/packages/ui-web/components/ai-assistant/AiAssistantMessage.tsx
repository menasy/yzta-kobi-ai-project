"use client";

import type { AiAssistantMessageProps } from "@repo/ui-contracts";

import { ChatMessage } from "../chat/ChatMessage";

export function AiAssistantMessage({ message, isOptimistic }: AiAssistantMessageProps) {
  return (
    <ChatMessage
      message={message}
      isOptimistic={isOptimistic}
      surface="panel"
    />
  );
}
