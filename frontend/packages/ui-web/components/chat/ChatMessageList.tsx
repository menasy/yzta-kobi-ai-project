"use client";

import React, { useEffect } from "react";
import type { ChatMessageListProps } from "@repo/ui-contracts";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

export function ChatMessageList({
  messages,
  isTyping,
  bottomRef,
}: ChatMessageListProps) {
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, bottomRef]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 scroll-smooth">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {messages.map((message, index) => {
          // If it's an optimistic message, it might have an id. Otherwise fallback to index.
          const key = "id" in message ? message.id : `msg-${index}`;
          const isOptimistic = "isOptimistic" in message ? message.isOptimistic : false;

          return (
            <ChatMessage
              key={key}
              message={message}
              isOptimistic={isOptimistic}
            />
          );
        })}

        {isTyping && <TypingIndicator />}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
