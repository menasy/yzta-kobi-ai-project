"use client";

import { cn } from "@repo/core";
import type { AiAssistantHeaderProps } from "@repo/ui-contracts";
import { Trash2, X } from "lucide-react";

import Image from "next/image";
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
        "flex items-center gap-3 border-b border-border/40 px-5 py-4",
        "bg-gradient-to-r from-background via-background/95 to-primary/5 backdrop-blur-xl",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 shadow-sm">
            <Image
              src="/next-assets/logo-icon.svg"
              alt="KOBİ Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-success ring-1 ring-success/20 animate-pulse" />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-foreground tracking-tight">
              AI Asistan
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {contextBadge ? (
              <span className="text-[11px] text-muted-foreground/80 font-medium truncate">
                {contextBadge}
              </span>
            ) : (
              <span className="text-[11px] text-success/80 font-semibold tracking-wide uppercase">
                Aktif
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          disabled={isClearPending}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
          aria-label="Konuşmayı temizle"
          id="ai-assistant-clear-btn"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
          aria-label="AI panelini kapat"
          id="ai-assistant-close-btn"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
