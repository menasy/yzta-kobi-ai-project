"use client";

import { cn } from "@repo/core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Logo,
} from "@repo/ui-web";
import { motion } from "framer-motion";
import Link from "next/link";

import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthPageVariant = "login" | "register";

interface AuthPageContent {
  subtitle: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
}

const AUTH_PAGE_CONTENT: Record<AuthPageVariant, AuthPageContent> = {
  login: {
    subtitle: "Yönetici paneline güvenli giriş yapın",
    title: "Giriş Yap",
    description: "Hesabınıza erişmek için bilgilerinizi girin.",
    footerText: "Hesabınız yok mu?",
    footerHref: "/auth/register",
    footerLinkLabel: "Ücretsiz kayıt olun",
  },
  register: {
    subtitle: "Yeni bir yönetici hesabı oluşturun",
    title: "Hesap Oluştur",
    description: "Platforma katılmak için formu doldurun.",
    footerText: "Zaten hesabınız var mı?",
    footerHref: "/auth/login",
    footerLinkLabel: "Giriş yapın",
  },
};

interface AuthPageViewProps {
  variant: AuthPageVariant;
}

export function AuthPageView({ variant }: AuthPageViewProps) {
  const content = AUTH_PAGE_CONTENT[variant];

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-background px-4 py-20">
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-full -translate-x-1/2 opacity-20 blur-[100px] [background:radial-gradient(circle_at_center,hsl(var(--primary))_0,transparent_70%)]" />
      <div className="absolute -left-24 top-48 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-[60px]" />
      <div className="absolute -right-24 top-24 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-3 shadow-xl shadow-primary/20 ring-1 ring-primary/20"
          >
            <Logo variant="icon" className="h-10 w-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            KOBİ <span className="text-primary">AI</span>
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {content.subtitle}
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-2xl shadow-primary/5 ring-1 ring-border/5 backdrop-blur-md">
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-2xl font-bold">{content.title}</CardTitle>
            <CardDescription className="text-base">
              {content.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {variant === "login" ? <LoginForm /> : <RegisterForm />}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {content.footerText}{" "}
          <Link
            href={content.footerHref}
            className={cn(
              "font-bold text-primary underline-offset-4 hover:underline",
            )}
          >
            {content.footerLinkLabel}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
