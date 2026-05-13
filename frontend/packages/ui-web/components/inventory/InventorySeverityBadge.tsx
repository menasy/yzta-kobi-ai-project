import { cn } from "@repo/core";
import * as React from "react";
import { Badge } from "../shadcn/badge";

export type InventorySeverity = "info" | "warning" | "critical";

const severityConfig: Record<
  InventorySeverity,
  { label: string; dotClass: string; badgeClass: string }
> = {
  info: {
    label: "Yeterli Stok",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  warning: {
    label: "Düşük Stok",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15",
  },
  critical: {
    label: "Kritik Stok",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15",
  },
};

interface InventorySeverityBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  severity: InventorySeverity;
}

export function InventorySeverityBadge({
  severity,
  className,
  ...props
}: InventorySeverityBadgeProps) {
  const config = severityConfig[severity] || severityConfig.info;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-0.5 font-bold transition-all duration-300 border text-[10px] uppercase tracking-wider",
        config.badgeClass,
        className
      )}
      {...props}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          config.dotClass,
          severity === "critical" || severity === "warning" ? "animate-pulse" : ""
        )} 
      />
      {config.label}
    </Badge>
  );
}
