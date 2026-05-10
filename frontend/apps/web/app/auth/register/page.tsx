"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@repo/ui";
import { motion } from "framer-motion";


export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Decorative Background Elements */}
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
            Yeni bir yönetici hesabı oluşturun
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/5 ring-1 ring-border/5">
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-2xl font-bold">Hesap Oluştur</CardTitle>
            <CardDescription className="text-base">
              Platforma katılmak için formu doldurun.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <RegisterForm />
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <a href="/auth/login" className="font-bold text-primary hover:underline underline-offset-4">
            Giriş yapın
          </a>
        </p>
      </motion.div>
    </div>
  );
}
