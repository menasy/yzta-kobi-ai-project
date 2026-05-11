import { AuthPageView } from "@/components/auth/AuthPageView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | KOBİ AI",
  description: "KOBİ AI yönetici paneline güvenli giriş yapın.",
};

export default function LoginPage() {
  return <AuthPageView variant="login" />;
}
