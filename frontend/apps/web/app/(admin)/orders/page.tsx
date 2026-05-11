import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { AdminOrderList } from "./_components/AdminOrderList";

export const metadata: Metadata = {
  title: "Siparişler | KOBİ AI",
  description: "Müşteri siparişleri takibi",
};

export default function OrdersPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <AdminOrderList />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
