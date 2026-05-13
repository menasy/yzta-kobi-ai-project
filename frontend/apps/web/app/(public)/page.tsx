import { PublicHome, CustomerHome, AdminHome } from "@repo/ui-web";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { extractAuthRoleFromToken } from "@repo/domain/auth/utils/jwt";
import { resolveKnownAuthRole } from "@repo/domain/auth/access/policy";

export const metadata: Metadata = {
  title: "KOBİ AI — Yapay Zeka Destekli İşletme Yönetimi",
  description: "Sipariş, stok, kargo ve müşteri iletişim süreçlerinizi tek bir platformda birleştiren akıllı yönetim asistanı.",
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const role = resolveKnownAuthRole(extractAuthRoleFromToken(token));

  if (role === "admin") {
    return <AdminHome />;
  }

  if (role === "customer") {
    return <CustomerHome />;
  }

  return <PublicHome />;
}
