"use client";

import { cn } from "@repo/core";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { AiAssistantErrorStateProps } from "@repo/ui-contracts";

import { Button } from "../shadcn/button";

/**
 * AiAssistantErrorState — Hata durumunda gösterilir.
 */
export function AiAssistantErrorState({ message, onRetry }: AiAssistantErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Bağlantı hatası
        </p>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          {message ?? "Mesajlar yüklenirken bir hata oluştu."}
        </p>
      </div>

      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 text-xs"
          id="ai-assistant-retry-btn"
        >
          <RefreshCw className="h-3 w-3" />
          Tekrar dene
        </Button>
      ) : null}
    </div>
  );
}
