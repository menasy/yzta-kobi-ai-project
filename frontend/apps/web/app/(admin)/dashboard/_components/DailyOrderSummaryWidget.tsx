"use client";

import { cn, formatCurrency } from "@repo/core";
import type { DashboardOverview } from "@repo/domain/orders";
import { Skeleton } from "@repo/ui-web";
import { motion } from "framer-motion";
import { AlertCircle, Package, TrendingUp, Clock, Truck, CheckCircle2, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface DailyOrderSummaryWidgetProps {
  overview: DashboardOverview | null;
  isLoading: boolean;
  error: unknown;
}

type StatColor = "success" | "primary" | "warning" | "chart";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: StatColor;
  trend: string;
  label: string;
  percentage: number;
}

const colorMap: Record<StatColor, string> = {
  success: "bg-success/10 text-success border-success/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  chart: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

const progressColorMap: Record<StatColor, string> = {
  success: "bg-success",
  primary: "bg-primary",
  warning: "bg-warning",
  chart: "bg-chart-2",
};

export function DailyOrderSummaryWidget({
  overview,
  isLoading,
  error,
}: DailyOrderSummaryWidgetProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/10 bg-destructive/5 rounded-2xl flex items-center gap-3 text-destructive text-xs font-bold uppercase tracking-wider">
        <AlertCircle className="h-4 w-4" />
        Veriler yüklenemedi.
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="p-4 border border-border bg-muted/20 rounded-2xl text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Dashboard özeti için veri bulunamadı.
      </div>
    );
  }

  const totalOrders = Math.max(overview.total_orders, 1);
  const pendingWorkload = overview.pending_orders + overview.processing_orders;
  
  const stats: DashboardStat[] = [
    {
      title: "Toplam Gelir",
      value: formatCurrency(overview.total_revenue, "tr-TR", overview.currency),
      icon: <TrendingUp className="h-4 w-4" />,
      color: "success",
      trend: `${overview.new_orders_today} yeni`,
      label: "BUGÜN",
      percentage: Math.min((overview.total_revenue / 10000) * 100, 100),
    },
    {
      title: "Siparişler",
      value: overview.total_orders,
      icon: <Package className="h-4 w-4" />,
      color: "primary",
      trend: `${overview.new_orders_today} Yeni`,
      label: "GÜNLÜK",
      percentage: Math.min((overview.total_orders / 50) * 100, 100),
    },
    {
      title: "Bekleyen",
      value: pendingWorkload,
      icon: <Clock className="h-4 w-4" />,
      color: "warning",
      trend: `${overview.pending_orders}/${overview.processing_orders}`,
      label: "HAZIRLANIYOR",
      percentage: (pendingWorkload / totalOrders) * 100,
    },
    {
      title: "Kargoda",
      value: overview.shipped_orders,
      icon: <Truck className="h-4 w-4" />,
      color: "chart",
      trend: `${overview.shipped_orders} Paket`,
      label: "YOLDA",
      percentage: (overview.shipped_orders / totalOrders) * 100,
    },
    {
      title: "Teslim Edildi",
      value: overview.delivered_orders,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "success",
      trend: "Başarılı",
      label: "TAMAMLANAN",
      percentage: (overview.delivered_orders / totalOrders) * 100,
    }
  ];

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="relative group p-6 bg-background border border-border/40 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700">
            {stat.icon}
          </div>

          <div className="flex flex-col gap-6 relative">
            <div className="flex items-center justify-between">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border-2", colorMap[stat.color])}>
                {stat.icon}
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/5 px-2 py-0.5 rounded-lg uppercase tracking-tighter border border-success/10">
                  <ArrowUpRight className="h-3 w-3" /> {stat.trend}
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] leading-none">
                {stat.title}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                  {stat.value}
                </span>
              </div>
              <div className="pt-2">
                 <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1.5, ease: "easeOut" }}
                      className={cn("h-full rounded-full", progressColorMap[stat.color])}
                    />
                 </div>
                 <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-2">
                   {stat.label} DURUMU
                 </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
