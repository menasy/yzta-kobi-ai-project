import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
import { ReceiptText, Calendar, Hash } from "lucide-react";
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
    <Card className="border-border/40 shadow-sm overflow-hidden rounded-xl sticky top-24">
      <CardHeader className="bg-primary/5 border-b border-border/40 pb-5 p-5 sm:p-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
          <ReceiptText className="h-5 w-5" />
          Sipariş Özeti
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center group">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="h-4 w-4 text-muted-foreground/70" />
              Sipariş ID
            </span>
            <span className="font-semibold text-foreground">#{order.id}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground/70" />
              Tarih
            </span>
            <span className="font-medium text-sm text-foreground">{formatDate(order.created_at)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Durum</span>
            <OrderStatusBadge status={order.status || "pending"} />
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 mt-6 flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Toplam Tutar</span>
          <span className="text-3xl sm:text-4xl font-bold text-primary tracking-tighter">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
