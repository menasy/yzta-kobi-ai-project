import type { Metadata } from "next";

import { AuthPageView } from "@/components/auth/AuthPageView";

export const metadata: Metadata = {
  title: "Kayıt Ol | KOBİ AI",
  description: "KOBİ AI için yeni bir yönetici hesabı oluşturun.",
};

export default function RegisterPage() {
  return <AuthPageView variant="register" />;
}
