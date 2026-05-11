"use client";

import { useLowStock } from "@repo/domain/inventory/hooks/useLowStock";
import { AlertCircle, PackageX, TrendingDown } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "../shadcn/alert";
import { Skeleton } from "../shadcn/skeleton";
import { InventorySeverityBadge } from "./InventorySeverityBadge";

export function LowStockAlerts() {
  const { alerts, isLoading, error } = useLowStock();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center p-4 border rounded-lg gap-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>
          Stok uyarıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </AlertDescription>
      </Alert>
    );
  }

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert) => (
        <Alert
          key={alert.product_id}
          variant={alert.severity === "critical" ? "destructive" : "default"}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            {alert.severity === "critical" ? (
              <PackageX className="h-5 w-5 text-destructive mt-0.5" />
            ) : (
              <TrendingDown className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <AlertTitle className="flex items-center gap-2">
                {alert.product_name}
                <InventorySeverityBadge severity={alert.severity} className="hidden sm:inline-flex" />
              </AlertTitle>
              <AlertDescription className="mt-1">
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  SKU: {alert.product_sku}
                </span>
                Mevcut stok ({alert.current_quantity}), kritik eşiğin ({alert.threshold}) altına düştü.
              </AlertDescription>
            </div>
          </div>
          <div className="sm:hidden mt-2">
            <InventorySeverityBadge severity={alert.severity} />
          </div>
        </Alert>
      ))}
    </div>
  );
}
