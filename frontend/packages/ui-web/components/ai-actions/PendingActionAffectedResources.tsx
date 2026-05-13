"use client";

import { cn } from "@repo/core";
import type { AiActionAffectedResource } from "@repo/domain/ai-actions";

interface PendingActionAffectedResourcesProps {
  resources: readonly AiActionAffectedResource[];
  className?: string;
}

export function PendingActionAffectedResources({
  resources,
  className,
}: PendingActionAffectedResourcesProps) {
  const previewLabels = resources
    .slice(0, 3)
    .map((resource) => resource.label || resource.resourceId);
  const remainingCount = Math.max(resources.length - previewLabels.length, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Etkilenen kayıtlar
        </span>
        <span className="text-xs font-semibold text-foreground">
          {resources.length}
        </span>
      </div>

      {previewLabels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previewLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-foreground"
            >
              {label}
            </span>
          ))}
          {remainingCount > 0 ? (
            <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
              +{remainingCount} kayıt daha
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
