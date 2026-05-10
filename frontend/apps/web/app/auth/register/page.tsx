import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol | KOBİ AI",
  description: "KOBİ AI platformuna yeni hesap oluşturun.",
};

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@repo/ui";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/20">
            K
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">KOBİ AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yeni bir yönetici hesabı oluşturun
          </p>
        </div>

        <Card className="border-none shadow-xl ring-1 ring-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Hesap Oluştur</CardTitle>
            <CardDescription>
              Platforma katılmak için formu doldurun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <a href="/auth/login" className="font-medium text-primary hover:underline underline-offset-4">
            Giriş yapın
          </a>
        </p>
      </div>
    </div>
  );
}
