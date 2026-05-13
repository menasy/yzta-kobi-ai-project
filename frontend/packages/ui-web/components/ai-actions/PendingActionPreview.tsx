"use client";

import { cn } from "@repo/core";
import type { AiActionPreviewItem } from "@repo/domain/ai-actions";

interface PendingActionPreviewProps {
  preview: readonly AiActionPreviewItem[];
  className?: string;
}

function stringifyPreviewValues(values: Record<string, unknown>): string {
  const entries = Object.entries(values);

  if (entries.length === 0) {
    return "Yok";
  }

  return entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ");
}

export function PendingActionPreview({
  preview,
  className,
}: PendingActionPreviewProps) {
  const visiblePreviewItems = preview.slice(0, 5);
  const remainingCount = Math.max(preview.length - visiblePreviewItems.length, 0);

  if (visiblePreviewItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Önizleme
        </span>
        <span className="text-xs text-muted-foreground">
          {preview.length} kayıt
        </span>
      </div>

      <div className="space-y-3">
        {visiblePreviewItems.map((item) => (
          <div
            key={`${item.resourceType}-${item.resourceId}`}
            className="rounded-2xl border border-border/50 bg-muted/20 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.label || item.resourceId}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.resourceType}
                </p>
              </div>

              {item.warning ? (
                <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-1 text-[10px] font-medium text-warning">
                  Uyarı
                </span>
              ) : null}
            </div>

            <div className="mt-3 grid gap-2 text-xs">
              <div className="rounded-xl border border-border/50 bg-background px-3 py-2">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Önce
                </span>
                <span className="mt-1 block text-foreground">
                  {stringifyPreviewValues(item.before)}
                </span>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Sonra
                </span>
                <span className="mt-1 block text-foreground">
                  {stringifyPreviewValues(item.after)}
                </span>
              </div>
            </div>

            {item.warning ? (
              <p className="mt-2 text-xs text-warning">{item.warning}</p>
            ) : null}
          </div>
        ))}
      </div>

      {remainingCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          +{remainingCount} kayıt daha gizlendi.
        </p>
      ) : null}
    </div>
  );
}
