/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
"use client";


import { useMyOrder } from "@repo/domain/orders";
import {
  OrderItemList,
  OrderShippingInfo,
  OrderSummary,
  Button,
} from "@repo/ui-web";
import { AlertCircle, ArrowLeft, Loader2, Package, MapPin, ReceiptText } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/50" asChild>
            <Link href="/orders/my">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Sipariş #{orderData.id}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Sipariş detaylarınızı ve teslimat durumunu takip edin
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-border/40 bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-5 sm:p-6 border-b border-border/40 bg-muted/10">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg tracking-tight">Sipariş Edilen Ürünler</h3>
            </div>
            <div className="p-0 sm:p-6">
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
