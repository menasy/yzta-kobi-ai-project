"use client";

import { useDailySummary } from "@repo/domain/orders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui-web";
import { AlertCircle, Package, TrendingUp, Clock, Truck, CheckCircle2 } from "lucide-react";

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function DailyOrderSummaryWidget() {
  const { data: summaryResponse, isLoading, error } = useDailySummary();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Günlük Özet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
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
            <p>Günlük özet yüklenirken bir hata oluştu: {error?.message || "Bilinmeyen hata"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = summaryResponse?.data;

  if (!summary) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Bugünkü siparişlerden</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Siparişler</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_orders}</div>
          <p className="text-xs text-muted-foreground mt-1">Bugün alınan toplam sipariş</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
          <Clock className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">İşlem bekleyen</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kargoda</CardTitle>
          <Truck className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.shipped}</div>
          <p className="text-xs text-muted-foreground mt-1">Yolda olanlar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Teslim Edildi</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.delivered}</div>
          <p className="text-xs text-muted-foreground mt-1">Bugün teslim edilenler</p>
        </CardContent>
      </Card>
    </div>
  );
}
