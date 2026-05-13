"use client";

import { cn } from "@repo/core";
import {
  getAiPageLabel,
  getAiQuickActionsForPage,
  type AiPageContext,
} from "@repo/domain/ai-actions";

import { Button } from "../shadcn/button";

interface AdminAiQuickActionsProps {
  pageContext: AiPageContext | null;
  onSelectPrompt: (prompt: string) => Promise<unknown>;
  isPending?: boolean;
  className?: string;
}

export function AdminAiQuickActions({
  pageContext,
  onSelectPrompt,
  isPending = false,
  className,
}: AdminAiQuickActionsProps) {
  if (!pageContext || pageContext.page === "chat") {
    return null;
  }

  const quickActions = getAiQuickActionsForPage(pageContext.page);
  if (quickActions.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "border-b border-border/40 bg-muted/10 px-4 py-3 md:px-5",
        className,
      )}
      aria-label="AI hızlı aksiyon önerileri"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hızlı İstekler
          </p>
          <p className="text-sm text-foreground">
            {getAiPageLabel(pageContext.page)} bağlamı için öneriler
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickActions.map((quickAction) => (
          <Button
            key={quickAction.id}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            className="h-auto whitespace-normal rounded-full px-3 py-2 text-left text-xs"
            onClick={() => {
              void onSelectPrompt(quickAction.prompt);
            }}
          >
            {quickAction.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
