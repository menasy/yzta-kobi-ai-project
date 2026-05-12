"use client";

import { PageShell, ResponsiveSection } from "@repo/ui-web";
import { DailyOrderSummaryWidget } from "./_components/DailyOrderSummaryWidget";
import { DashboardChart } from "./_components/DashboardChart";
import { 
  LayoutDashboard, 
  Zap, 
  ShoppingCart, 
  Box, 
  TrendingUp, 
  MessageSquare, 
  Truck, 
  Bell,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@repo/core";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <PageShell>
      <ResponsiveSection className="pt-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 px-1">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <div className="relative">
                <LayoutDashboard className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-background" />
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
          {/* Üst İstatistikler */}
          <section className="relative">
            <DailyOrderSummaryWidget />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Grafik Alanı - (2/3) */}
            <div className="lg:col-span-8">
              <DashboardChart />
            </div>

            {/* Hızlı Erişim Kartları - (1/3) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2 px-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">Hızlı Navigasyon</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <NavCard 
                  icon={<Box className="h-5 w-5" />} 
                  title="Envanter" 
                  desc="STOK VE ÜRÜN YÖNETİMİ" 
                  onClick={() => router.push("/inventory")}
                  color="amber"
                />
                <NavCard 
                  icon={<ShoppingCart className="h-5 w-5" />} 
                  title="Siparişler" 
                  desc="MÜŞTERİ TALEPLERİ" 
                  onClick={() => router.push("/orders")}
                  color="primary"
                />
                <NavCard 
                  icon={<MessageSquare className="h-5 w-5" />} 
                  title="AI Chat" 
                  desc="AKILLI ASİSTAN" 
                  onClick={() => router.push("/chat")}
                  color="emerald"
                />
                <NavCard 
                  icon={<Truck className="h-5 w-5" />} 
                  title="Kargo" 
                  desc="LOJİSTİK VE TESLİMAT" 
                  onClick={() => router.push("/shipping")}
                  color="indigo"
                />
              </div>
            </div>
          </div>
        </div>
      </ResponsiveSection>
    </PageShell>
  );
}

function NavCard({ icon, title, desc, onClick, color }: { icon: any, title: string, desc: string, onClick: () => void, color: string }) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
  };

  const hoverColorMap: any = {
    primary: "hover:border-primary/50",
    amber: "hover:border-amber-500/50",
    emerald: "hover:border-emerald-500/50",
    indigo: "hover:border-indigo-500/50",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "group w-full flex items-center justify-between p-5 bg-background border border-border/40 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 text-left relative overflow-hidden",
        hoverColorMap[color]
      )}
    >
      <div className="flex items-center gap-5 relative z-10">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-sm", colorMap[color])}>
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
        <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Subtle hover background highlight */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700", colorMap[color].split(' ')[1])} />
    </button>
  );
}
