import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { AdminOrderDetail } from "./_components/AdminOrderDetail";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <AdminOrderDetail orderId={id} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
