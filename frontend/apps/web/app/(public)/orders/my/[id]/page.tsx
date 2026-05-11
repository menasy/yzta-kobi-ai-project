import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { CustomerOrderDetail } from "./_components/CustomerOrderDetail";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
  description: "Müşteri siparişi detayları",
};

export default function MyOrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <CustomerOrderDetail orderId={params.id} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
