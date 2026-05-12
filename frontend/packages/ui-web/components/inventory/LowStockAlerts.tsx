"use client";

import { useLowStock } from "@repo/domain/inventory/hooks/useLowStock";
import { AlertCircle, PackageX, TrendingDown, ArrowRight, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../shadcn/skeleton";
import { InventorySeverityBadge } from "./InventorySeverityBadge";
import { cn } from "@repo/core";

export function LowStockAlerts() {
  const { alerts, isLoading, error } = useLowStock();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center p-5 border border-white/5 rounded-2xl gap-4 bg-muted/10 animate-pulse">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-destructive/10 bg-destructive/5 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium">
        <AlertCircle className="h-5 w-5" />
        Sistem uyarıları yüklenirken bir hata oluştu.
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 border border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-emerald-500/5 border-emerald-500/20">
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-600">
          <Box className="h-5 w-5" />
        </div>
        <p className="text-sm font-bold text-emerald-700/80 uppercase tracking-widest">Tüm Stoklar Yeterli</p>
        <p className="text-xs text-emerald-600/60 mt-1">Kritik eşiğin altında ürün bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnimatePresence>
        {alerts.map((alert, index) => {
          const gap = alert.threshold - alert.current_quantity;
          const percentage = Math.max(0, (alert.current_quantity / alert.threshold) * 100);
          
          return (
            <motion.div
              key={alert.product_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={cn(
                "group relative overflow-hidden p-5 border rounded-2xl transition-all duration-500",
                alert.severity === "critical" 
                  ? "bg-rose-500/[0.03] border-rose-500/10 hover:border-rose-500/20 shadow-sm hover:shadow-rose-500/5" 
                  : "bg-amber-500/[0.03] border-amber-500/10 hover:border-amber-500/20 shadow-sm hover:shadow-amber-500/5"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-lg",
                    alert.severity === "critical" 
                      ? "bg-rose-500 text-white shadow-rose-500/20" 
                      : "bg-amber-500 text-white shadow-amber-500/20"
                  )}>
                    {alert.severity === "critical" ? <PackageX className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                      {alert.product_name}
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                        alert.severity === "critical" ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                      )}>
                        {alert.severity === "critical" ? "Kritik" : "Düşük"}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      <span>SKU: {alert.product_sku}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                      <span>Eşik: {alert.threshold}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-2xl font-black tracking-tighter leading-none",
                      alert.severity === "critical" ? "text-rose-600" : "text-amber-600"
                    )}>
                      {alert.current_quantity}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Adet</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold text-rose-600/60 flex items-center gap-1">
                      <ArrowRight className="h-2.5 w-2.5" /> {gap} adet eksik
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 space-y-2">
                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      alert.severity === "critical" ? "bg-rose-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
