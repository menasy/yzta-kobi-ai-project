import { ResponsiveContainer, ResponsiveSection, ShipmentPageContent } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sevkiyatlar | KOBİ AI",
  description: "Teslimat ve lojistik yönetimi",
};

export default function ShipmentsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <ShipmentPageContent />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
