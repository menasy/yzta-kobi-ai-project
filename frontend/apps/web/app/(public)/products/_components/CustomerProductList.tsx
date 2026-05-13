"use client";

import { useProducts } from "@repo/domain/products";
import { ProductCard, GlobalLoader } from "@repo/ui-web";
import { AlertCircle, PackageSearch } from "lucide-react";

export function CustomerProductList() {
  const { products, isLoading, error } = useProducts({ isActive: true });

  if (isLoading) {
    return <GlobalLoader className="py-20" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Bir Hata Oluştu</h2>
        <p className="mt-2 text-muted-foreground">Ürünler yüklenirken bir sorun yaşandı. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
          <PackageSearch className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">Ürün Bulunamadı</h2>
        <p className="mt-2 text-muted-foreground">Şu anda listelenecek aktif bir ürün bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
