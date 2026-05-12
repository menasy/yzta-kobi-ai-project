"use client";

import { cn } from "@repo/core";
import { useDashboardOverview } from "@repo/domain/orders";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { DailyOrderSummaryWidget } from "./DailyOrderSummaryWidget";
import { DashboardChart } from "./DashboardChart";

type NavCardVariant = "primary" | "success" | "warning" | "chart";

interface NavCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  href: string;
  color: NavCardVariant;
}

const navColorMap: Record<NavCardVariant, string> = {
  primary: "text-primary bg-primary/10 border-primary/20",
  success: "text-success bg-success/10 border-success/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  chart: "text-chart-2 bg-chart-2/10 border-chart-2/20",
};

const navHoverColorMap: Record<NavCardVariant, string> = {
  primary: "hover:border-primary/50",
  success: "hover:border-success/50",
  warning: "hover:border-warning/50",
  chart: "hover:border-chart-2/50",
};

export function DashboardClient() {
  const { overview, isLoading, error } = useDashboardOverview();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <div className="relative">
              <LayoutDashboard className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-success rounded-full animate-pulse border-2 border-background" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em]">Yönetim Merkezi</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
            Genel Bakış
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-md">
            İşletmenizin performans verilerini ve yönetim araçlarını buradan takip edebilirsiniz.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-2"
        >
          <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-2 shadow-sm">
            <Zap className="h-4 w-4 text-primary fill-primary/20" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Sistem Durumu: Aktif</span>
          </div>
        </motion.div>
      </div>

      <div className="space-y-20">
        <section className="relative">
          <DailyOrderSummaryWidget
            overview={overview}
            isLoading={isLoading}
            error={error}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <DashboardChart
              performance={overview?.weekly_performance ?? []}
              currency={overview?.currency ?? "TRY"}
              isLoading={isLoading}
              error={error}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Zap className="h-4 w-4 text-warning" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">Hızlı Navigasyon</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <NavCard
                icon={<Box className="h-5 w-5" />}
                title="Envanter"
                desc="STOK VE ÜRÜN YÖNETİMİ"
                href="/inventory"
                color="warning"
              />
              <NavCard
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Siparişler"
                desc="MÜŞTERİ TALEPLERİ"
                href="/orders"
                color="primary"
              />
              <NavCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="AI Chat"
                desc="AKILLI ASİSTAN"
                href="/chat"
                color="success"
              />
              <NavCard
                icon={<Truck className="h-5 w-5" />}
                title="Kargo"
                desc="LOJİSTİK VE TESLİMAT"
                href="/shipments"
                color="chart"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NavCard({ icon, title, desc, href, color }: NavCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        "group w-full flex items-center justify-between p-5 bg-background border border-border/40 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/5 text-left relative overflow-hidden",
        navHoverColorMap[color],
      )}
    >
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-sm", navColorMap[color])}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-black text-foreground leading-none group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-[9px] font-black text-muted-foreground/30 mt-2 uppercase tracking-[0.2em]">{desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <span className="text-[10px] font-black text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 uppercase tracking-widest">
          GİT
        </span>
        <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700", navColorMap[color])} />
    </button>
  );
}
