import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";
import { AdminProductDetail } from "./_components/AdminProductDetail";

export const metadata: Metadata = {
  title: "Ürün Detayı | KOBİ AI",
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <AdminProductDetail productId={id} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
