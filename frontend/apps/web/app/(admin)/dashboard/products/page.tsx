import type { Metadata } from "next";
import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";

export const metadata: Metadata = {
  title: "Ürün Yönetimi | KOBİ AI",
  description: "Ürün listesi ve düzenleme",
};

export default function ProductsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">TODO</h1>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
