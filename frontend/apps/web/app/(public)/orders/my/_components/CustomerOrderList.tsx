"use client";

import { useMyOrders } from "@repo/domain/orders";
import {
  OrderStatusBadge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  GlobalLoader,
} from "@repo/ui-web";
import { AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

function getOrderName(order: any) {
  // @ts-ignore - Backend might add name later, check if it exists
  if (order.name) return order.name;
  
  const items = order.items || [];
  if (items.length === 0) return "Sipariş";
  
  const firstItem = items[0];
  const firstProductName = firstItem.product_name || "Ürün";
  
  if (items.length === 1) {
    return firstProductName;
  }
  
  return `${firstProductName} ve ${items.length - 1} ürün daha`;
}

export function CustomerOrderList() {
  const router = useRouter();
  const { orders, isLoading, error } = useMyOrders();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Siparişlerim</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalLoader className="py-12" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Siparişleriniz yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Siparişlerim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">Henüz bir siparişiniz bulunmamaktadır.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sipariş Geçmişim</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orders.map((order) => (
          <Card 
            key={order.id} 
            className="group cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden"
            onClick={() => router.push(`/orders/my/${order.id}`)}
          >
            <div className="p-5 sm:p-6 flex flex-col h-full justify-between gap-5 relative">
              
              {/* Top: Metadata & Action */}
              <div className="flex justify-between items-start gap-4">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-medium">Sipariş</span>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                         #{order.id}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2.5">
                       <OrderStatusBadge status={order.status || "pending"} />
                       <span className="text-muted-foreground/30">•</span>
                       <span className="text-xs font-medium text-muted-foreground tracking-wide">
                          {formatDate(order.created_at)}
                       </span>
                    </div>
                 </div>
                 
                 {/* Decorative/Action Button */}
                 <div className="h-10 w-10 shrink-0 rounded-full bg-accent/50 flex items-center justify-center group-hover:bg-primary group-hover:shadow-md transition-all duration-300 transform group-hover:scale-105">
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                 </div>
              </div>

              {/* Middle: Content */}
              <div className="py-4 border-y border-border/50">
                 <p className="font-medium text-sm sm:text-base text-foreground line-clamp-2 leading-relaxed" title={getOrderName(order)}>
                    {getOrderName(order)}
                 </p>
              </div>

              {/* Bottom: Financials */}
              <div className="flex justify-between items-end pt-1">
                 <p className="text-[11px] sm:text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-1">
                    Toplam Tutar
                 </p>
                 <p className="font-bold text-xl sm:text-2xl text-primary tracking-tighter">
                    {formatCurrency(order.total_amount)}
                 </p>
              </div>
              
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
