"use client";

import { useOrder, useUpdateOrderStatus } from "@repo/domain/orders";
import type { OrderStatus } from "@repo/domain/orders";
import { useShowSuccess, useShowError } from "@repo/state/stores/message";
import {
  OrderItemList,
  OrderShippingInfo,
  OrderSummary,
  Button,
} from "@repo/ui-web";
import { AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";


interface AdminOrderDetailProps {
  orderId: string;
}

export function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const router = useRouter();
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const { data: order, isLoading, error } = useOrder(orderId);
  const { updateOrderStatusAsync: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order?.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Sipariş Bulunamadı</h2>
        <p className="text-muted-foreground">
          {error?.message || "Aradığınız sipariş sistemde bulunmuyor olabilir."}
        </p>
        <Button onClick={() => router.push("/orders")}>Siparişlere Dön</Button>
      </div>
    );
  }

  const orderData = order.data;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    try {
      await updateStatus({
        orderId: orderData.id!,
        data: { status: selectedStatus },
      });
      showSuccess("Başarılı", "Sipariş durumu güncellendi.");
      setSelectedStatus("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Sipariş durumu güncellenemedi.";
      showError("Hata", errorMessage);
    }
  };

  const statuses: { value: OrderStatus; label: string }[] = [
    { value: "pending", label: "Bekliyor" },
    { value: "processing", label: "İşleniyor" },
    { value: "shipped", label: "Kargoya Verildi" },
    { value: "delivered", label: "Teslim Edildi" },
    { value: "cancelled", label: "İptal Edildi" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Sipariş #{orderData.order_id || orderData.id}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight">Sipariş Kalemleri</h3>
            </div>
            <div className="p-6">
              <OrderItemList items={orderData.items || []} />
            </div>
          </div>
          
          <OrderShippingInfo shipping={orderData.shipping} />
        </div>

        <div className="space-y-6">
          <OrderSummary order={orderData} />

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h3 className="font-semibold leading-none tracking-tight">Durum Güncelle</h3>
            <div className="space-y-3">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                disabled={isUpdating}
              >
                <option value="" disabled>Durum Seçiniz</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value} disabled={s.value === orderData.status}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button 
                className="w-full" 
                disabled={!selectedStatus || isUpdating}
                onClick={() => { void handleStatusUpdate(); }}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isUpdating && <CheckCircle2 className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
