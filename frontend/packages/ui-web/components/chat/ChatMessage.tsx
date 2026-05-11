"use client";

import React from "react";
import { cn } from "@repo/core";
import type { ChatMessageProps } from "@repo/ui-contracts";
import { Avatar, AvatarFallback } from "@repo/ui";
import { Bot, User } from "lucide-react";

export function ChatMessage({ message, isOptimistic }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4",
        isUser ? "flex-row-reverse" : "flex-row",
        isOptimistic && "opacity-70",
      )}
    >
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
          {isUser ? (
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-accent text-accent-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-2xl px-5 py-3.5 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/50 text-foreground border border-border/40 rounded-tl-sm",
        )}
      >
        <span className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </span>
      </div>
    </div>
  );
}
