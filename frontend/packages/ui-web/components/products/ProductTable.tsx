"use client";

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
    return <GlobalLoader className="py-12" />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <h3 className="mt-4 text-lg font-semibold">Ürün Bulunamadı</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Arama kriterlerinize uygun veya kayıtlı bir ürün bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead className="text-right">Fiyat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
              onClick={() => onRowClick?.(product.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                          (e.target as HTMLImageElement).className = "h-full w-full object-cover p-2 opacity-50";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md border bg-muted/50 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Yok</span>
                    </div>
                  )}
                  <span className="line-clamp-2 max-w-[200px]">{product.name}</span>
                </div>
              </TableCell>
              <TableCell>{product.sku || "-"}</TableCell>
              <TableCell>{product.category || "-"}</TableCell>
              <TableCell>
                <ProductStatusBadge isActive={product.is_active} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDate(product.created_at)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(product.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
