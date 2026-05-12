"use client";

import { useInventory } from "@repo/domain/inventory/hooks/useInventory";
import type { InventoryItem } from "@repo/domain/inventory/types/inventory.types";
import { Edit2, PackageSearch, ChevronRight, Hash, Box, ArrowUpRight } from "lucide-react";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@repo/core";

import { Button } from "../shadcn/button";
import { Skeleton } from "../shadcn/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn/table";
import { InventorySeverityBadge } from "./InventorySeverityBadge";
import { UpdateStockDialog } from "./UpdateStockDialog";

export function InventoryTable() {
  const { inventory, isLoading } = useInventory();
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const getSeverity = (item: InventoryItem) => {
    if (item.available_quantity <= 0) return "critical";
    if (item.available_quantity <= item.low_stock_threshold) return "warning";
    return "info";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-12 items-center justify-center min-h-[400px] bg-card/20 rounded-3xl border border-dashed">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Box className="absolute inset-0 m-auto h-6 w-6 text-primary/50" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Envanter listesi yükleniyor...</p>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-[2rem] bg-card/10">
        <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
          <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Stok Kaydı Bulunamadı</h3>
        <p className="text-muted-foreground max-w-sm">
          Arama kriterlerinize uygun stok kaydı bulunamadı veya henüz hiç ürün eklenmedi.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group/container">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-background/50 backdrop-blur-xl shadow-xl">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-white/5">
                <TableHead className="py-4 px-6 font-bold text-foreground text-xs uppercase tracking-wider">Ürün Bilgisi</TableHead>
                <TableHead className="font-bold text-foreground text-center text-xs uppercase tracking-wider">Mevcut</TableHead>
                <TableHead className="font-bold text-foreground text-center text-xs uppercase tracking-wider">Rezerve</TableHead>
                <TableHead className="font-bold text-foreground text-center text-xs uppercase tracking-wider">Kullanılabilir</TableHead>
                <TableHead className="font-bold text-foreground text-center text-xs uppercase tracking-wider">Durum</TableHead>
                <TableHead className="w-[60px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {inventory.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.03 } }}
                    whileHover={{ backgroundColor: "rgba(var(--muted), 0.03)" }}
                    className="group/row transition-all duration-300 border-b border-white/5 last:border-0 cursor-pointer relative"
                    onClick={() => handleEditClick(item)}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted/40 flex items-center justify-center border border-white/5 group-hover/row:bg-primary/10 transition-colors duration-300">
                          <Box className="h-5 w-5 text-muted-foreground group-hover/row:text-primary transition-colors duration-300" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base tracking-tight text-foreground group-hover/row:text-primary transition-colors duration-300">
                            {item.product_name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                              <Hash className="h-2 w-2" /> {item.product_sku}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-base font-semibold text-foreground/70">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-medium text-muted-foreground/60">
                        {item.reserved_quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center min-w-[60px]">
                        <span className="text-lg font-black tracking-tighter text-foreground">
                          {item.available_quantity}
                        </span>
                        <div className="h-0.5 w-full bg-primary/10 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="h-full bg-primary/60"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <InventorySeverityBadge severity={getSeverity(item)} className="scale-90" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 rounded-lg bg-primary/0 flex items-center justify-center transition-all duration-300 group-hover/row:bg-primary group-hover/row:shadow-lg group-hover/row:shadow-primary/30 group-hover/row:scale-105">
                          <Edit2 className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover/row:text-primary-foreground" />
                        </div>
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-primary/60 rounded-r-full transition-all duration-300 group-hover/row:h-1/2"></div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      <UpdateStockDialog
        item={selectedItem}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
