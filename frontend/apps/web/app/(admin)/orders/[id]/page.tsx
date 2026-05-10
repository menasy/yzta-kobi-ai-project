import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sipariş #{params.id}
        </h1>
        <p className="text-sm text-muted-foreground">
          Sipariş detayları ve geçmişi
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Sipariş detayları yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
