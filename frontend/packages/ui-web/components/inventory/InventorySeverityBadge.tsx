import { cn } from "@repo/core";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Badge, badgeVariants } from "../shadcn/badge";

export type InventorySeverity = "info" | "warning" | "critical";

interface InventorySeverityBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  severity: InventorySeverity;
}

export function InventorySeverityBadge({
  severity,
  className,
  ...props
}: InventorySeverityBadgeProps) {
  return (
    <Badge
      className={cn(
        "px-2 py-0.5 text-xs font-semibold shadow-sm transition-colors",
        {
          "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50":
            severity === "info",
          "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50":
            severity === "warning",
          "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50":
            severity === "critical",
        },
        className,
      )}
      variant="outline"
      {...props}
    >
      {severity === "info" && "Bilgi"}
      {severity === "warning" && "Düşük Stok"}
      {severity === "critical" && "Kritik Stok"}
    </Badge>
  );
}
