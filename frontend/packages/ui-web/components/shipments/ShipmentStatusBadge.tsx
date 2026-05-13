import { Badge } from "../shadcn/badge";
import { cn } from "@repo/core";
import type { ShipmentStatus } from "@repo/domain/shipments/types/shipments.types";

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const statusConfig: Record<
  ShipmentStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  created: {
    label: "Oluşturuldu",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15",
  },
  in_transit: {
    label: "Yolda",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15",
  },
  delivered: {
    label: "Teslim Edildi",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  delayed: {
    label: "Gecikti",
    dotClass: "bg-orange-500",
    badgeClass: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/15",
  },
  failed: {
    label: "Başarısız",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15",
  },
  cancelled: {
    label: "İptal Edildi",
    dotClass: "bg-slate-500",
    badgeClass: "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/15",
  },
};

export function ShipmentStatusBadge({ status, className }: ShipmentStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-0.5 font-semibold transition-all duration-300 border w-fit",
        config.badgeClass,
        className
      )}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          config.dotClass,
          (status === "created" || status === "in_transit") ? "animate-pulse" : ""
        )} 
      />
      {config.label}
    </Badge>
  );
}
