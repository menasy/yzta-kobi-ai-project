import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { Order } from "@repo/domain/orders";

interface OrderSummaryProps {
  order: Order;
}

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sipariş Özeti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sipariş ID</span>
          <span className="font-medium">#{order.order_id || order.id}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tarih</span>
          <span className="font-medium text-sm">{formatDate(order.created_at)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Durum</span>
          <OrderStatusBadge status={order.status || "pending"} />
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="font-semibold">Toplam Tutar</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
