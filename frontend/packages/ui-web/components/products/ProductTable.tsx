"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ImageOff, PackageOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../shadcn/table";
import { GlobalLoader } from "../shared/GlobalLoader";
import { ProductStatusBadge } from "./ProductStatusBadge";
import type { Product } from "@repo/domain/products";
import { cn } from "@repo/core";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onRowClick?: (productId: number | string) => void;
}

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
  }).format(new Date(dateString));
}

export function ProductTable({
  products,
  isLoading,
  onRowClick,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-8 items-center justify-center min-h-[400px]">
        <GlobalLoader className="scale-125" />
        <p className="text-sm text-muted-foreground animate-pulse">Ürünler yükleniyor...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/5 p-12 text-center"
      >
        <div className="rounded-full bg-muted/20 p-4 mb-4">
          <PackageOpen className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">Ürün Bulunamadı</h3>
        <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">
          Arama kriterlerinize uygun veya kayıtlı bir ürün bulunmuyor. Lütfen filtreleri kontrol edin.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[400px] font-semibold text-foreground py-4">Ürün Bilgisi</TableHead>
            <TableHead className="font-semibold text-foreground">SKU</TableHead>
            <TableHead className="font-semibold text-foreground">Kategori</TableHead>
            <TableHead className="font-semibold text-foreground">Durum</TableHead>
            <TableHead className="font-semibold text-foreground">Kayıt Tarihi</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Fiyat</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ backgroundColor: "rgba(var(--muted), 0.05)" }}
                className={cn(
                  "group/row transition-all duration-300 border-b last:border-0 relative",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(product.id)}
              >
                <TableCell className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm group-hover/row:shadow-md transition-all duration-300">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/row:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-muted/50 text-muted-foreground transition-colors group-hover/row:bg-muted/30",
                        product.image_url ? "hidden" : ""
                      )}>
                        <ImageOff className="h-6 w-6 opacity-40" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-foreground leading-tight group-hover/row:text-primary transition-colors duration-300">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded">
                          ID: #{product.id}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                          • Düzenlemek için tıklayın
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded-md border border-border/50 group-hover/row:border-primary/20 group-hover/row:bg-primary/5 transition-all duration-300">
                    {product.sku || "-"}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-muted-foreground group-hover/row:text-foreground transition-colors duration-300">
                    {product.category || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <ProductStatusBadge isActive={product.is_active} className="scale-110 origin-left" />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground font-medium">
                    {formatDate(product.created_at)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-lg tracking-tight text-foreground group-hover/row:text-primary transition-colors duration-300">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Birim Fiyat
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-[60px]">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/0 flex items-center justify-center transition-all duration-300 group-hover/row:bg-primary group-hover/row:shadow-lg group-hover/row:shadow-primary/30 group-hover/row:scale-105">
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover/row:text-primary-foreground group-hover/row:translate-x-0.5" />
                    </div>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
