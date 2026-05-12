"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn/table";
import { Card, CardContent } from "../shadcn/card";
import { Button } from "../shadcn/button";
import { PackageSearch, ChevronRight, Truck, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";
import type { Shipment, TrackingNumber } from "@repo/domain/shipments";
import { useRouter } from "next/navigation";

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

interface ShipmentTableProps {
  shipments: Shipment[];
  isLoading: boolean;
}

export function ShipmentTable({ shipments, isLoading }: ShipmentTableProps) {
  const router = useRouter();

  const handleRowClick = (trackingNumber: TrackingNumber) => {
    router.push(`/shipments/${trackingNumber}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-12 items-center justify-center min-h-[400px] bg-card/20 rounded-3xl border border-dashed">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Truck className="absolute inset-0 m-auto h-5 w-5 text-primary/50" />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Kargolar yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="relative border-none bg-background/50 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-white/5">
                <TableHead className="py-4 px-6 font-bold text-foreground text-xs uppercase tracking-wider">Takip Numarası</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Sipariş ID</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Firma</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Durum</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Son Güncelleme</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {shipments.map((shipment, index) => (
                  <motion.tr
                    key={shipment.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03 } }}
                    whileHover={{ backgroundColor: "rgba(var(--muted), 0.03)" }}
                    className="group/row transition-all duration-300 border-b border-white/5 last:border-0 cursor-pointer relative"
                    onClick={() => handleRowClick(shipment.tracking_number)}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-foreground group-hover/row:text-primary transition-colors duration-300">
                          {shipment.tracking_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-muted-foreground group-hover/row:text-foreground transition-colors duration-300">
                        #{shipment.order_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{shipment.carrier}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ShipmentStatusBadge status={shipment.status} className="scale-90 origin-left" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(shipment.updated_at || shipment.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 rounded-lg bg-primary/0 flex items-center justify-center transition-all duration-300 group-hover/row:bg-primary group-hover/row:shadow-lg group-hover/row:shadow-primary/30 group-hover/row:scale-105">
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover/row:text-primary-foreground group-hover/row:translate-x-0.5" />
                        </div>
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-primary/60 rounded-r-full transition-all duration-300 group-hover/row:h-1/2"></div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          {shipments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <PackageSearch className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Kargo Bulunamadı</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Arama kriterlerinize uygun sevkiyat kaydı bulunmamaktadır.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
