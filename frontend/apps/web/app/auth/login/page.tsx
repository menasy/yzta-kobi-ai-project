import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş | KOBİ AI",
  description: "KOBİ AI yönetici paneline giriş yapın.",
};

import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/brand/logo";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@repo/ui";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Marka */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex rounded-xl bg-primary/10 p-2 shadow-lg shadow-primary/20">
            <Logo variant="icon" className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">KOBİ AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yönetici paneline güvenli giriş yapın
          </p>
        </div>

        <Card className="border-none shadow-xl ring-1 ring-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza erişmek için bilgilerinizi girin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <a href="/auth/register" className="font-medium text-primary hover:underline underline-offset-4">
            Ücretsiz kayıt olun
          </a>
        </p>
      </div>
    </div>
  );
}
