"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "../shadcn/card";
import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
import { Package, ArrowRight, XCircle } from "lucide-react";
import type { Product } from "@repo/domain/products";
import { formatCurrency } from "@repo/core";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.is_active;

  return (
    <Card className="group overflow-hidden border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
            <Package className="h-12 w-12" />
          </div>
        )}
        {product.category && (
          <Badge className="absolute left-3 top-3 bg-background/80 backdrop-blur-md text-foreground border-none">
            {product.category}
          </Badge>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
            <Badge variant="destructive" className="gap-1 px-3 py-1.5 font-semibold">
              <XCircle className="h-3.5 w-3.5" />
              Satışta Değil
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.sku}</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
        </div>
        <h3 className="line-clamp-1 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed h-10">
          {product.description || "Bu ürün için bir açıklama bulunmamaktadır."}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full h-11 text-sm font-bold shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          disabled={!isAvailable}
        >
          <Link
            href={`/products/${product.id}`}
            className="flex items-center justify-center gap-2"
          >
            <Package className="h-4 w-4" />
            Sipariş Ver
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
