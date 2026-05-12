import { Badge } from "../shadcn/badge";
import { cn } from "@repo/core";

interface ProductStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ProductStatusBadge({ isActive, className }: ProductStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-0.5 font-medium transition-all duration-300",
        isActive 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15" 
          : "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/15",
        className
      )}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        )} 
      />
      {isActive ? "Aktif" : "Pasif"}
    </Badge>
  );
}
