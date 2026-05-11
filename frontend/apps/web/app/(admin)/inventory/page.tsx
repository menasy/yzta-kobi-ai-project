import type { Metadata } from "next";
import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";

export const metadata: Metadata = {
  title: "Stok Yönetimi | KOBİ AI",
  description: "Envanter ve stok durumu takibi",
};

export default function InventoryPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection className="flex min-h-[400px] items-center justify-center">
        <h1 className="text-4xl font-extrabold tracking-tight opacity-20">TODO</h1>
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
