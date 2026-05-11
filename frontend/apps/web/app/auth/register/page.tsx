import type { Metadata } from "next";

import { AuthPageView } from "@/components/auth/AuthPageView";

export const metadata: Metadata = {
  title: "Hesap Oluştur | KOBİ AI",
  description: "Platforma katılmak için yeni bir yönetici hesabı oluşturun.",
};

export default function RegisterPage() {
  return <AuthPageView variant="register" />;
}
