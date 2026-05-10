import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürünler | KOBİ AI",
  description: "Ürün kataloğu ve fiyat yönetimi",
};

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ürünler
        </h1>
        <p className="text-sm text-muted-foreground">
          Ürün kataloğunuzu ve fiyatlandırmayı buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Ürün listesi yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
