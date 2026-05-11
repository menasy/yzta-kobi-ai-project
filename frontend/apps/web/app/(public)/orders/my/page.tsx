import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

import { CustomerOrderList } from "./_components/CustomerOrderList";

export const metadata: Metadata = {
  title: "Siparişlerim | KOBİ AI",
  description: "Geçmiş siparişleriniz",
};

export default function MyOrdersPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <CustomerOrderList />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
