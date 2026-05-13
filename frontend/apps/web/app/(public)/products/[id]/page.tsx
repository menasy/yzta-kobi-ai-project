import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";
import { CustomerProductDetail } from "./_components/CustomerProductDetail";


export const metadata: Metadata = {
  title: "Ürün Detayı | KOBİ AI",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="pt-10 pb-20">
        <CustomerProductDetail productId={id} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
