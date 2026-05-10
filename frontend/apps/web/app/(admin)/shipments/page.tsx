import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kargo Takibi | KOBİ AI",
  description: "Kargo durumları ve teslimat takibi",
};

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Kargo Takibi
        </h1>
        <p className="text-sm text-muted-foreground">
          Tüm sevkiyatların anlık durumunu izleyin.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Kargo listesi yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
