import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürün Detayı | KOBİ AI",
};

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ürün Detayı: {id}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ürün bilgilerini ve stok durumunu güncelleyin.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-20 text-center">
        <p className="text-sm text-muted-foreground">
          Ürün detay formu yakında eklenecek.
        </p>
      </div>
    </div>
  );
}
