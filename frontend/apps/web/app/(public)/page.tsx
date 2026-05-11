import { CustomerHome } from "@repo/ui-web";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOBİ AI — Müşteri İşlem Merkezi",
  description: "Sipariş sorgulama, kargo takibi ve stok durumu sorgulama merkezi.",
};

export default function HomePage() {
  return <CustomerHome />;
}
