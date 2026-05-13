import { ResponsiveContainer, ResponsiveSection, ShipmentDetailView } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kargo Detayı | KOBİ AI",
  description: "Kargo süreç takibi ve detayları",
};

export default async function ShipmentDetailsPage({
  params,
}: {
  params: Promise<{ tracking_number: string }>;
}) {
  const { tracking_number } = await params;

  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <ShipmentDetailView trackingNumber={tracking_number} />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
