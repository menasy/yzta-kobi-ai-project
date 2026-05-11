import { Badge } from "../shadcn/badge";
import { cn } from "@repo/core";
import type { OrderStatus } from "@repo/domain/orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  pending: {
    label: "Bekliyor",
    variant: "secondary",
    className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/20",
  },
  processing: {
    label: "İşleniyor",
    variant: "secondary",
    className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20",
  },
  shipped: {
    label: "Kargoya Verildi",
    variant: "secondary",
    className: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20 border-chart-1/20",
  },
  delivered: {
    label: "Teslim Edildi",
    variant: "secondary",
    className: "bg-success/10 text-success hover:bg-success/20 border-success/20",
  },
  cancelled: {
    label: "İptal Edildi",
    variant: "destructive",
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: "outline",
  };

  return (
    <Badge
      variant={config.variant}
      className={cn("whitespace-nowrap capitalize", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
