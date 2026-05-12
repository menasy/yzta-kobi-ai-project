"use client";

import { cn } from "@repo/core";
import type { AiAssistantHeaderProps } from "@repo/ui-contracts";
import { Bot, X, Trash2 } from "lucide-react";

import { Button } from "../shadcn/button";

/**
 * AiAssistantHeader — Panel üst barı.
 * Logo, başlık, opsiyonel context badge, temizle ve kapat butonları.
 */
export function AiAssistantHeader({
  onClose,
  onClearChat,
  isClearPending,
  contextBadge,
}: AiAssistantHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border/50 px-4 py-3",
        "bg-background/95 backdrop-blur-md",
      )}
    >
      {/* AI icon + title */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground leading-tight">
            AI Asistan
          </span>
          {contextBadge ? (
            <span className="text-[10px] text-muted-foreground leading-tight truncate">
              {contextBadge}
            </span>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          disabled={isClearPending}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Konuşmayı temizle"
          id="ai-assistant-clear-btn"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="AI panelini kapat"
          id="ai-assistant-close-btn"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
