"use client";

import { cn } from "@repo/core";
import { Bot, Sparkles } from "lucide-react";
import type { AiAssistantEmptyStateProps } from "@repo/ui-contracts";

/**
 * AiAssistantEmptyState — İlk açılışta veya sıfırlandıktan sonra görünür.
 */
export function AiAssistantEmptyState({ className }: AiAssistantEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-7 w-7 text-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          KOBİ AI Asistan
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
          İşletmenizle ilgili sorular sorun, siparişler hakkında bilgi alın veya
          destek isteyin.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <Sparkles className="h-3 w-3" />
        <span>Yapay zeka destekli</span>
      </div>
    </div>
  );
}
