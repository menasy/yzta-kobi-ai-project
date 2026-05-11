"use client";

import { useMyOrder } from "@repo/domain/orders";
import {
  OrderItemList,
  OrderShippingInfo,
  OrderSummary,
  Button,
} from "@repo/ui-web";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CustomerOrderDetailProps {
  orderId: string;
}

export function CustomerOrderDetail({ orderId }: CustomerOrderDetailProps) {
  const router = useRouter();
  const { data: order, isLoading, error } = useMyOrder(orderId);

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
          {error?.message || "Aradığınız siparişe erişilemiyor."}
        </p>
        <Button onClick={() => router.push("/orders/my")}>Siparişlerime Dön</Button>
      </div>
    );
  }

  const orderData = order.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders/my">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Sipariş Detayı #{orderData.order_id || orderData.id}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b">
              <h3 className="font-semibold leading-none tracking-tight">Sipariş Edilen Ürünler</h3>
            </div>
            <div className="p-6">
              <OrderItemList items={orderData.items || []} />
            </div>
          </div>
          
          <OrderShippingInfo shipping={orderData.shipping} />
        </div>

        <div className="space-y-6">
          <OrderSummary order={orderData} />
        </div>
      </div>
    </div>
  );
}
