import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stok Yönetimi | KOBİ AI",
  description: "Envanter ve stok durumu takibi",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Envanter
        </h1>
        <p className="text-sm text-muted-foreground">
          Stok seviyelerinizi ve envanter hareketlerini yönetin.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Envanter listesi yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
