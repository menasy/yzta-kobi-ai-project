import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";
import { AdminProductCreate } from "./_components/AdminProductCreate";

export const metadata: Metadata = {
  title: "Yeni Ürün Ekle | KOBİ AI",
  description: "Kataloğa yeni bir ürün ekleyin.",
};

export default function NewProductPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <AdminProductCreate />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
