import type { Metadata } from "next";

import { AuthPageView } from "@/components/auth/AuthPageView";

export const metadata: Metadata = {
  title: "Giriş Yap | KOBİ AI",
  description: "KOBİ AI yönetici paneline güvenli giriş yapın.",
};

export default function LoginPage() {
  return <AuthPageView variant="login" />;
}
