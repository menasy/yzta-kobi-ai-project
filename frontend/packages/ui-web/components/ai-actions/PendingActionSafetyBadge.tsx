"use client";

import { cn } from "@repo/core";
import type { AiActionSafetyLevel } from "@repo/domain/ai-actions";

import { Badge } from "../shadcn/badge";

interface PendingActionSafetyBadgeProps {
  safetyLevel: AiActionSafetyLevel;
  className?: string;
}

const SAFETY_BADGE_CONFIG: Record<
  AiActionSafetyLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Düşük risk",
    className:
      "border-success/20 bg-success/10 text-success hover:bg-success/15",
  },
  medium: {
    label: "Orta risk",
    className:
      "border-warning/20 bg-warning/10 text-warning hover:bg-warning/15",
  },
  high: {
    label: "Yüksek risk",
    className:
      "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15",
  },
};

export function PendingActionSafetyBadge({
  safetyLevel,
  className,
}: PendingActionSafetyBadgeProps) {
  const config = SAFETY_BADGE_CONFIG[safetyLevel];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "w-fit border px-2.5 py-1 text-[11px] font-semibold",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
