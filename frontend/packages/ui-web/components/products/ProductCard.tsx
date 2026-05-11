"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, Badge, Button } from "@repo/ui-web";
import { ShoppingCart, ArrowRight } from "lucide-react";
import type { Product } from "@repo/domain/products";
import { formatCurrency } from "@repo/core";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {product.category && (
          <Badge className="absolute left-3 top-3 bg-background/80 backdrop-blur-md text-foreground border-none">
            {product.category}
          </Badge>
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
      <CardFooter className="p-4 pt-0 gap-2">
        <Button asChild variant="outline" className="flex-1 group/btn h-10 border-primary/20 hover:border-primary/50">
          <Link href={`/products/${product.id}`} className="flex items-center justify-center gap-2">
            İncele
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
