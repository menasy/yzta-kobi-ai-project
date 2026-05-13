"use client";

import { cn } from "@repo/core";
import type { ChatMessageProps } from "@repo/ui-contracts";
import { Bot, User } from "lucide-react";

import { PendingActionCard } from "../ai-actions/PendingActionCard";
import { PendingActionGroupCard } from "../ai-actions/PendingActionGroupCard";
import { AiInsightCard } from "../ai-actions/AiInsightCard";
import { Avatar, AvatarFallback } from "../shadcn/avatar";

export function ChatMessage({
  message,
  isOptimistic,
  surface = "page",
  onActionMessage,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isPanelSurface = surface === "panel";

  return (
    <div
      className={cn(
        "flex w-full gap-4",
        isPanelSurface ? "px-4 py-2.5" : "p-4",
        isUser ? "flex-row-reverse" : "flex-row",
        isOptimistic && "opacity-70",
      )}
    >
      <div className="flex-shrink-0">
        <Avatar
          className={cn(
            "border border-border/50 shadow-sm",
            isPanelSurface ? "h-8 w-8" : "h-10 w-10",
          )}
        >
          {isUser ? (
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className={cn(isPanelSurface ? "h-4 w-4" : "h-5 w-5")} />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-accent text-accent-foreground">
              <Bot className={cn(isPanelSurface ? "h-4 w-4" : "h-5 w-5")} />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className={cn("flex min-w-0 flex-col gap-3", isPanelSurface ? "max-w-[85%]" : "max-w-[80%]")}>
        <div
          className={cn(
            "flex flex-col gap-2 rounded-2xl text-sm shadow-sm",
            isPanelSurface ? "px-4 py-3 text-[14px]" : "px-5 py-3.5",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border/40 bg-muted/50 text-foreground",
          )}
        >
          <span className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </span>
        </div>

        {!isUser && (
          <div className="flex flex-col gap-3">
            {message.insight ? (
              <AiInsightCard insight={message.insight} />
            ) : null}

            {message.pendingActionGroup ? (
              <PendingActionGroupCard
                pendingActionGroup={message.pendingActionGroup}
                onActionMessage={onActionMessage}
              />
            ) : message.pendingAction ? (
              <PendingActionCard
                pendingAction={message.pendingAction}
                onActionMessage={onActionMessage}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
