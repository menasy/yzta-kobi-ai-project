import React from "react";
import { cn } from "@repo/core";

export interface AdaptiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

/**
 * İçeriği mobile'da tek kolon, desktop'ta kolon sayısına göre sıralayan grid.
 */
export function AdaptiveGrid({
  children,
  className,
  columns = 2,
  ...props
}: AdaptiveGridProps) {
  return (
    <div
      className={cn(
        "grid gap-panel gap-y-6", // Panel gap CSS variable kullanır
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
