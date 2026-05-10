import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sipariş #{id}
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
