import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sipariş Detayı | KOBİ AI",
};

export default function OrderDetailsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">TODO</h1>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
