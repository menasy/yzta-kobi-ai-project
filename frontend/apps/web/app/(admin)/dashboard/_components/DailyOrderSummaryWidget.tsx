"use client";

import { useDailySummary } from "@repo/domain/orders";
import { AlertCircle, Package, TrendingUp, Clock, Truck, CheckCircle2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@repo/core";
import { Skeleton } from "@repo/ui-web";

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DailyOrderSummaryWidget() {
  const { data: summaryResponse, isLoading, error } = useDailySummary();

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

  const summary = summaryResponse?.data;
  if (!summary) return null;

  const totalOrders = summary.total_orders || 1; // Avoid division by zero
  
  const stats = [
    {
      title: "Toplam Gelir",
      value: formatCurrency(summary.total_revenue),
      icon: <TrendingUp className="h-4 w-4" />,
      color: "emerald",
      trend: "+12.5%",
      label: "BUGÜN",
      percentage: Math.min((summary.total_revenue / 10000) * 100, 100) // Target 10k
    },
    {
      title: "Siparişler",
      value: summary.total_orders,
      icon: <Package className="h-4 w-4" />,
      color: "primary",
      trend: `${summary.total_orders} Yeni`,
      label: "GÜNLÜK",
      percentage: Math.min((summary.total_orders / 50) * 100, 100) // Target 50
    },
    {
      title: "Bekleyen",
      value: summary.pending,
      icon: <Clock className="h-4 w-4" />,
      color: "amber",
      trend: summary.pending > 5 ? "Kritik" : "Normal",
      label: "HAZIRLANIYOR",
      percentage: (summary.pending / totalOrders) * 100
    },
    {
      title: "Kargoda",
      value: summary.shipped,
      icon: <Truck className="h-4 w-4" />,
      color: "indigo",
      trend: `${summary.shipped} Paket`,
      label: "YOLDA",
      percentage: (summary.shipped / totalOrders) * 100
    },
    {
      title: "Teslim Edildi",
      value: summary.delivered,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "emerald",
      trend: "Başarılı",
      label: "TAMAMLANAN",
      percentage: (summary.delivered / totalOrders) * 100
    }
  ];

  const colorMap: any = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  };

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
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-lg uppercase tracking-tighter border border-emerald-500/10">
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
                      className={cn("h-full rounded-full", 
                        stat.color === 'emerald' ? 'bg-emerald-500' : 
                        stat.color === 'primary' ? 'bg-primary' : 
                        stat.color === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'
                      )}
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
