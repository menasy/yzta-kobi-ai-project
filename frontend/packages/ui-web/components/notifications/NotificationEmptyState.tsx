"use client";

import { cn } from "@repo/core";
import { BellOff } from "lucide-react";

interface NotificationEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function NotificationEmptyState({
  title = "Bildirim yok",
  description = "Henüz hiç bildiriminiz bulunmuyor. Yeni bildirimler burada görünecek.",
  className,
}: NotificationEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
        <BellOff className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground/80">
        {title}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
