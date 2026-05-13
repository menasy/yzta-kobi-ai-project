import { Badge } from "../shadcn/badge";
import { cn } from "@repo/core";
import type { OrderStatus } from "@repo/domain/orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  pending: {
    label: "Bekliyor",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15",
  },
  processing: {
    label: "İşleniyor",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15",
  },
  shipped: {
    label: "Kargoya Verildi",
    dotClass: "bg-indigo-500",
    badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/15",
  },
  delivered: {
    label: "Teslim Edildi",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15",
  },
  cancelled: {
    label: "İptal Edildi",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15",
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-0.5 font-semibold transition-all duration-300 border",
        config.badgeClass,
        className
      )}
    >
      <span 
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          config.dotClass,
          status === "pending" || status === "processing" ? "animate-pulse" : ""
        )} 
      />
      {config.label}
    </Badge>
  );
}
