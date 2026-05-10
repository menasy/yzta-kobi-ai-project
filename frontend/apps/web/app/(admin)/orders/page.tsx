import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Siparişler | KOBİ AI",
  description: "Tüm siparişlerin listesi ve yönetimi",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Siparişler
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm müşteri siparişlerini buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Sipariş listesi yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
