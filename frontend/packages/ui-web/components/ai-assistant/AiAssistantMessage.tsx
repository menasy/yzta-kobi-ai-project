"use client";

import { cn } from "@repo/core";
import type { AiAssistantMessageProps } from "@repo/ui-contracts";
import { Bot, User } from "lucide-react";

/**
 * AiAssistantMessage — Kompakt tekil mesaj bileşeni.
 * Chat sayfasındakine benzer ama global panel için daha kompakt.
 */
export function AiAssistantMessage({ message, isOptimistic }: AiAssistantMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-2.5 px-3 py-1.5",
        isUser ? "flex-row-reverse" : "flex-row",
        isOptimistic && "opacity-60",
      )}
    >
      {/* Compact avatar */}
      <div
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary/10 text-primary"
            : "bg-accent text-accent-foreground",
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex max-w-[85%] flex-col rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/50 text-foreground border border-border/40 rounded-tl-sm",
        )}
      >
        <span className="whitespace-pre-wrap">{message.content}</span>
      </div>
    </div>
  );
}
