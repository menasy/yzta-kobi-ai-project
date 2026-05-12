"use client";

import { useOrders } from "@repo/domain/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  OrderStatusBadge,
  Card,
  CardContent,
  Button,
  OrderCreateSheet,
} from "@repo/ui-web";
import { AlertCircle, Plus, ShoppingBag, ChevronRight, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProducts } from "@repo/domain/products";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@repo/core";

function formatCurrency(amount: number = 0) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

export function AdminOrderList() {
  const router = useRouter();
  const { orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-12 items-center justify-center min-h-[400px] bg-card/20 rounded-3xl border border-dashed">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <ShoppingBag className="absolute inset-0 m-auto h-5 w-5 text-primary/50" />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Siparişler hazırlanıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border border-destructive/10 bg-destructive/5 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium">
        <AlertCircle className="h-5 w-5" />
        Sipariş listesi yüklenirken bir hata oluştu.
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Card className="relative border-none bg-background/50 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/5 group/card">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b border-white/5">
                    <TableHead className="py-4 px-6 font-bold text-foreground text-xs uppercase tracking-wider">Sipariş No</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Müşteri</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Tarih</TableHead>
                    <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Durum</TableHead>
                    <TableHead className="text-right font-bold text-foreground text-xs uppercase tracking-wider pr-6">Toplam</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {(orders || []).map((order, index) => (
                      <motion.tr
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03 } }}
                        whileHover={{ backgroundColor: "rgba(var(--muted), 0.03)" }}
                        className="group/row transition-all duration-300 border-b border-white/5 last:border-0 cursor-pointer relative"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-foreground group-hover/row:text-primary transition-colors duration-300">
                              #{order.order_id || String(order.id).slice(0, 8)}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-widest mt-0.5">
                              ID: {String(order.id).slice(0, 6)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center border border-white/5 group-hover/row:bg-primary/10 transition-colors duration-300">
                              <User className="h-4 w-4 text-muted-foreground group-hover/row:text-primary transition-colors duration-300" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground text-sm leading-tight">
                                {order.customer_name || "Misafir Müşteri"}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60">
                                {order.customer_email || "E-posta belirtilmemiş"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                              <Calendar className="h-3 w-3 text-muted-foreground/60" />
                              {formatDate(order.created_at).split(" ")[0]}
                            </div>
                            <span className="text-[10px] text-muted-foreground/40 font-medium pl-4">
                              {formatDate(order.created_at).split(" ").slice(1).join(" ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status || "pending"} className="scale-90 origin-left" />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-black tracking-tight text-foreground group-hover/row:text-primary transition-colors duration-300">
                              {formatCurrency(order.total_amount)}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                              KDV Dahil
                            </span>
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
              {(!orders || orders.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Sipariş Bulunamadı</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Henüz hiçbir sipariş oluşturulmamış.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
