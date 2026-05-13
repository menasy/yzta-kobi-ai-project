"use client";

import { Card, CardContent } from "../shadcn/card";
import { Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@repo/core";
import { useShipments, useDelayedShipments } from "@repo/domain/shipments";
import { Skeleton } from "../shadcn/skeleton";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  isLoading?: boolean;
  colorClass?: string;
  bgClass?: string;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  colorClass = "text-primary",
  bgClass = "bg-primary/10",
}: SummaryCardProps) {
  return (
    <Card className="group relative overflow-hidden border border-white/5 bg-background/50 backdrop-blur-xl shadow-xl rounded-3xl transition-all duration-300 hover:shadow-2xl hover:bg-background/80 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
              {isLoading ? (
                <Skeleton className="h-10 w-24 mt-1" />
              ) : (
                <span className="text-3xl font-black tracking-tight text-foreground">{value}</span>
              )}
            </div>
            {description && !isLoading && (
              <span className="text-xs font-medium text-muted-foreground/80 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-current" />
                {description}
              </span>
            )}
          </div>
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
            bgClass
          )}>
            <Icon className={cn("h-7 w-7", colorClass)} />
          </div>
        </div>
      </CardContent>
      {/* Decorative background element */}
      <div className={cn(
        "absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150",
        bgClass
      )} />
    </Card>
  );
}

export function ShipmentSummaryCards() {
  const { shipments, isLoading: isShipmentsLoading } = useShipments();
  const { shipments: delayedShipments, isLoading: isDelayedLoading } = useDelayedShipments();

  // Hesaplamalar
  const totalShipments = shipments?.length || 0;
  const inTransitCount = shipments?.filter((s) => s.status === "in_transit").length || 0;
  const deliveredCount = shipments?.filter((s) => s.status === "delivered").length || 0;
  const delayedCount = delayedShipments?.length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={itemVariants}>
        <SummaryCard
          title="Toplam Sevkiyat"
          value={totalShipments}
          icon={Package}
          isLoading={isShipmentsLoading}
          description="Tüm zamanlar"
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SummaryCard
          title="Yolda"
          value={inTransitCount}
          icon={Truck}
          isLoading={isShipmentsLoading}
          colorClass="text-amber-500"
          bgClass="bg-amber-500/10"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SummaryCard
          title="Teslim Edilen"
          value={deliveredCount}
          icon={CheckCircle2}
          isLoading={isShipmentsLoading}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <SummaryCard
          title="Geciken"
          value={delayedCount}
          icon={AlertCircle}
          isLoading={isDelayedLoading}
          colorClass="text-rose-500"
          bgClass="bg-rose-500/10"
        />
      </motion.div>
    </motion.div>
  );
}
