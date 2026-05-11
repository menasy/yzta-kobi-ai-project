"use client";

import { useProduct } from "@repo/domain/products";
import { 
  Button, 
  Badge, 
  GlobalLoader, 
  Separator,
  Card,
  CardContent
} from "@repo/ui-web";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@repo/core";

interface CustomerProductDetailProps {
  productId: string;
}

export function CustomerProductDetail({ productId }: CustomerProductDetailProps) {
  const router = useRouter();
  const { product, isLoading, error } = useProduct(productId);

  if (isLoading) {
    return <GlobalLoader className="py-20" />;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Ürün Bulunamadı</h2>
        <p className="mt-2 text-muted-foreground">Aradığınız ürün stokta olmayabilir veya silinmiş olabilir.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/products")}>
          Tüm Ürünlere Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button 
        variant="ghost" 
        className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => router.push("/products")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Ürünlere Dön
      </Button>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Görsel Alanı */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted/30 border border-border/50">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/20">
              <ShoppingCart className="h-32 w-32" />
            </div>
          )}
          {product.category && (
            <Badge className="absolute left-6 top-6 px-4 py-1.5 bg-background/80 backdrop-blur-md text-foreground border-none text-sm font-medium">
              {product.category}
            </Badge>
          )}
        </div>

        {/* Detay Alanı */}
        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{product.sku}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-green-600 font-medium">Stokta Mevcut</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{product.name}</h1>
          
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-bold text-primary">{formatCurrency(product.price)}</span>
            <span className="text-lg text-muted-foreground line-through opacity-50">{formatCurrency(product.price * 1.2)}</span>
          </div>

          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            {product.description || "Bu ürün için detaylı bir açıklama girilmemiş ancak kalitesi ve dayanıklılığı ile işletmeniz için mükemmel bir tercih olacaktır."}
          </p>

          <div className="mt-10 space-y-4">
            <Button size="lg" className="h-14 w-full text-lg font-bold shadow-lg shadow-primary/20">
              <ShoppingCart className="mr-3 h-5 w-5" /> Sepete Ekle
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Güvenli ödeme ve 24 saat içinde kargo garantisi.
            </p>
          </div>

          {/* Özellikler */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 text-center">
              <Truck className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-semibold">Hızlı Teslimat</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 text-center">
              <ShieldCheck className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-semibold">Orijinal Ürün</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 text-center">
              <RefreshCcw className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs font-semibold">Kolay İade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
