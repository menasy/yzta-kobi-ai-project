import { ResponsiveContainer, ResponsiveSection } from "@repo/ui-web";
import type { Metadata } from "next";
import { AdminProductList } from "./_components/AdminProductList";

export const metadata: Metadata = {
  title: "Ürün Yönetimi | KOBİ AI",
  description: "Ürün listesi ve yönetimi",
};

export default function ProductsPage() {
  return (
    <ResponsiveContainer>
      <ResponsiveSection>
        <AdminProductList />
      </ResponsiveSection>
    </ResponsiveContainer>
  );
}
