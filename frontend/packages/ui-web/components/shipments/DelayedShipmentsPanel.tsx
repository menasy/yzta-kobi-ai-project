"use client";

import { useDelayedShipments } from "@repo/domain/shipments";
import { Alert, AlertDescription, AlertTitle } from "../shadcn/alert";
import { AlertTriangle, ChevronRight, Package, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "../shadcn/card";

export function DelayedShipmentsPanel() {
  const router = useRouter();
  const { shipments, isLoading, error } = useDelayedShipments();

  if (isLoading || error || !Array.isArray(shipments) || shipments.length === 0) {
    return null;
  }

  const getDelayDays = (date?: string | Date) => {
    if (!date) return 0;
    const estimated = new Date(date);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - estimated.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="mb-8 space-y-4"
      >
        {/* Minimalist Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-base font-black tracking-tight text-foreground">
                Geciken Sevkiyatlar
              </h3>
              <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
                {shipments.length} Kayıt
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 opacity-40">
            <Calendar className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase tracking-widest">Beklenen teslimat tarihi aşıldı</span>
          </div>
        </div>
        
        {/* Refined Card Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {shipments.map((shipment, index) => {
            const delayDays = getDelayDays(shipment.estimated_delivery_date);
            return (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => router.push(`/shipments/${shipment.tracking_number}`)}
                  className="group relative cursor-pointer border border-white/10 bg-background/30 backdrop-blur-3xl hover:bg-background/50 transition-all duration-300 p-4 rounded-xl flex flex-col gap-3 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Subtle Progress Indicator Bar */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20 group-hover:bg-amber-500 transition-all duration-300" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Takip No</span>
                      <p className="font-black text-sm tracking-tight text-foreground group-hover:text-amber-600 transition-colors">
                        {shipment.tracking_number}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Gecikme</span>
                      <span className="text-xl font-black text-amber-600 tracking-tighter">+{delayDays} Gün</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/5 w-full" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Sipariş ID</span>
                      <span className="font-black text-xs tracking-tighter">#{shipment.order_id}</span>
                    </div>
                    
                    {shipment.estimated_delivery_date && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Vade Tarihi</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/10">
                          <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                          <span className="font-black text-[9px] text-amber-700/80">
                            {new Intl.DateTimeFormat("tr-TR", { dateStyle: "short" }).format(new Date(shipment.estimated_delivery_date))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
