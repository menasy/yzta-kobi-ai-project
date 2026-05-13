import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { CustomerOrderDetail } from "./_components/CustomerOrderDetail";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
  description: "Müşteri siparişi detayları",
};

export default async function MyOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <CustomerOrderDetail orderId={id} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
