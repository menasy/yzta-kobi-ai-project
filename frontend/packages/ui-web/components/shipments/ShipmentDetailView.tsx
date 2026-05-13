"use client";

import { useShipment } from "@repo/domain/shipments";
import type { TrackingNumber } from "@repo/domain/shipments";
import { Package, MapPin, Calendar, Truck, ArrowLeft } from "lucide-react";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";
import { ShipmentEventTimeline } from "./ShipmentEventTimeline";
import { RefreshShipmentButton } from "./RefreshShipmentButton";
import { Skeleton } from "../shadcn/skeleton";
import { Button } from "../shadcn/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "../shadcn/card";

export function ShipmentDetailView({ trackingNumber }: { trackingNumber: TrackingNumber }) {
  const router = useRouter();
  const { shipment, isLoading, error } = useShipment(trackingNumber);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2"
      >
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/shipments")}
            className="h-12 w-12 rounded-xl bg-background/50 hover:bg-background border border-white/10 shadow-lg transition-all hover:scale-105"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter text-foreground">Kargo Detayı</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="opacity-40">Takip No:</span>
              <span className="text-primary font-black tracking-normal lowercase">{trackingNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <RefreshShipmentButton
            trackingNumber={trackingNumber}
            variant="outline"
            size="default"
            showText
            className="h-12 px-6 rounded-xl bg-background/50 border-white/10 shadow-lg backdrop-blur-3xl font-black text-xs uppercase tracking-widest hover:bg-background/80"
          />
        </div>
      </motion.div>

      {/* Hero Section: Core Info (Full Width) */}
      {shipment && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
      <Card className="border border-white/10 bg-background/50 backdrop-blur-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] rounded-[2rem] overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
                {/* Status Column */}
                <div className="space-y-3">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Güncel Durum</span>
                  <div className="flex items-center">
                    <ShipmentStatusBadge status={shipment.status} className="scale-110 origin-left" />
                  </div>
                </div>

                {/* Carrier Column */}
                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Lojistik Firması</span>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                      <Truck className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="font-black text-lg tracking-tight uppercase text-foreground">{shipment.carrier}</span>
                  </div>
                </div>

                {/* Delivery Date Column (Conditional) */}
                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
                    {shipment.status === 'delivered' ? 'Teslimat Tarihi' : 'Tahmini Teslimat'}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                      <Calendar className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="font-black text-lg tracking-tight text-foreground">
                      {shipment.status === 'delivered' 
                        ? (shipment.delivered_at ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(shipment.delivered_at)) : "-")
                        : (shipment.estimated_delivery_date ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(shipment.estimated_delivery_date)) : "Belirtilmedi")
                      }
                    </span>
                  </div>
                </div>

                {/* Location Column */}
                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Güncel Konum</span>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
                      <MapPin className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="font-black text-lg tracking-tight text-foreground">
                      {shipment.location || "Merkez Aktarma"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isLoading && (
        <div className="space-y-10">
          <Skeleton className="h-[180px] w-full rounded-[3rem]" />
          <div className="grid gap-10 lg:grid-cols-12">
            <Skeleton className="lg:col-span-8 h-[600px] rounded-[3rem]" />
            <Skeleton className="lg:col-span-4 h-[400px] rounded-[3rem]" />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <Card className="border border-destructive/20 bg-destructive/5 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-2xl">
          <CardContent className="p-20 flex flex-col items-center justify-center text-center">
            <div className="h-32 w-32 bg-destructive/10 rounded-full flex items-center justify-center mb-10 shadow-inner">
              <Package className="h-16 w-16 text-destructive opacity-80" />
            </div>
            <h3 className="text-4xl font-black mb-6 tracking-tighter">Kargo Bulunamadı</h3>
            <p className="text-muted-foreground max-w-lg mx-auto font-medium text-xl mb-12 leading-relaxed opacity-80">
              Sistemde bu takip numarasına ait bir kayıt bulunamadı. Lütfen numarayı kontrol edip tekrar deneyiniz.
            </p>
            <Button 
              size="lg"
              variant="default" 
              className="rounded-2xl h-16 px-12 font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95" 
              onClick={() => router.push("/shipments")}
            >
              Kargo Listesine Dön
            </Button>
          </CardContent>
        </Card>
      )}

      {shipment && !isLoading && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Main Content: Timeline (2/3) */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border border-white/10 bg-background/50 backdrop-blur-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] rounded-[2rem] overflow-hidden min-h-[500px]">
                <CardContent className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]" 
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-xl font-black tracking-tight">Kargo Hareketleri</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                          Süreç Takip Çizelgesi
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xl font-black text-primary tracking-tighter">
                        {shipment.events?.length || 0}
                      </span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                        İşlem
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-1">
                    <ShipmentEventTimeline events={shipment.events} />
                  </div>

                  {shipment.status === 'delivered' && (
                    <div className="mt-12 p-8 bg-emerald-500/5 rounded-[1.5rem] border border-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                          <Package className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-lg font-black text-emerald-500 tracking-tight">Teslim Edildi</h4>
                          <p className="text-xs font-medium text-emerald-500/60">Kargo alıcıya başarıyla ulaştırılmıştır.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-black text-emerald-500/40 uppercase tracking-[0.2em] mb-0.5">Tarih</span>
                        <span className="text-xl font-black text-emerald-500 tracking-tighter">
                          {shipment.delivered_at ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(shipment.delivered_at)) : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Secondary Info (1/3) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Order Reference Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-none bg-gradient-to-br from-primary via-primary to-primary/80 shadow-[0_16px_40px_rgba(var(--primary-rgb),0.25)] rounded-[2rem] overflow-hidden group">
                <CardContent className="p-8 relative">
                  <div className="absolute -top-8 -right-8 p-6 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                    <Package className="h-32 w-32 text-white" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">İlişkili Sipariş</span>
                      <h4 className="text-5xl font-black text-white tracking-tighter italic">#{shipment.order_id}</h4>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-xl h-14 font-black text-base shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 bg-white text-primary border-none uppercase tracking-widest"
                      onClick={() => router.push(`/orders/${shipment.order_id}`)}
                    >
                      SİPARİŞE GİT &rarr;
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Time Metadata Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border border-white/10 bg-background/50 backdrop-blur-3xl shadow-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">Zaman Çizelgesi</h3>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Oluşturulma</span>
                      <span className="text-xs font-black bg-muted/50 px-2.5 py-1 rounded-lg border border-white/5">
                        {shipment.created_at ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(shipment.created_at)) : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Son Güncelleme</span>
                      <span className="text-xs font-black bg-muted/50 px-2.5 py-1 rounded-lg border border-white/5">
                        {shipment.last_checked_at ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(shipment.last_checked_at)) : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
