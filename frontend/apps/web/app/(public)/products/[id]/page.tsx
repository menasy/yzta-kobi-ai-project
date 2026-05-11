import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürün Detayı | KOBİ AI",
};

export default function ProductDetailPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight opacity-20">Ürün Detayı TODO</h1>
          <p className="mt-4 text-muted-foreground">Müşteri ürün detay ve satın alma ekranı yakında burada olacak.</p>
        </div>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
