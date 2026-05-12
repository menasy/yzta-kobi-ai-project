"use client";

import { useEffect } from "react";
import type { AiAssistantMessageListProps } from "@repo/ui-contracts";

import { AiAssistantMessage } from "./AiAssistantMessage";
import { AiAssistantTypingIndicator } from "./AiAssistantTypingIndicator";
import { AiAssistantEmptyState } from "./AiAssistantEmptyState";

/**
 * AiAssistantMessageList — Scroll container + mesaj render.
 * Mesaj eklendiğinde otomatik aşağı scroll yapar.
 */
export function AiAssistantMessageList({
  messages,
  isTyping,
  bottomRef,
}: AiAssistantMessageListProps) {
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, bottomRef]);

  if (messages.length === 0 && !isTyping) {
    return <AiAssistantEmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-3 scroll-smooth">
      <div className="flex w-full flex-col gap-1">
        {messages.map((message, index) => {
          const key = "id" in message ? message.id : `msg-${index}`;
          const isOptimistic =
            "isOptimistic" in message ? message.isOptimistic : false;

          return (
            <AiAssistantMessage
              key={key}
              message={message}
              isOptimistic={isOptimistic}
            />
          );
        })}

        {isTyping ? <AiAssistantTypingIndicator /> : null}

        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
}
