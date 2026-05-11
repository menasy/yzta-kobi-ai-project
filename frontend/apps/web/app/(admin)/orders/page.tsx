import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Siparişler | KOBİ AI",
  description: "Müşteri siparişleri takibi",
};

export default function OrdersPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">TODO</h1>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
