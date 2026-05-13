'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  ArrowRight, 
  Search,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../shadcn/button';
import { PageShell, ResponsiveSection, AdaptiveGrid } from '../layout';
import { Card, CardContent } from '../shadcn/card';

export function PublicHome() {
  const serviceCards = [
    {
      title: 'Sipariş Takibi',
      description: 'Siparişlerinizin durumunu anında öğrenin ve teslimat sürecini izleyin.',
      icon: <Package className="size-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/auth/login?redirect=/orders/my'
    },
    {
      title: 'Ürün Kataloğu',
      description: 'Geniş ürün yelpazemizi keşfedin ve size en uygun seçenekleri bulun.',
      icon: <ShoppingBag className="size-6" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      href: '/products'
    },
    {
      title: 'AI Canlı Destek',
      description: 'Yapay zeka asistanımızla sorularınıza anında yanıt alın, destek talebi oluşturun.',
      icon: <Bot className="size-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/chat'
    },
    {
      title: 'Hızlı İletişim',
      description: 'Bizimle iletişime geçin, her türlü sorunuz için size yardımcı olalım.',
      icon: <MessageSquare className="size-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/chat'
    },
  ];

  return (
    <PageShell className="relative min-h-[90vh] overflow-hidden" containerSize="xl">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 opacity-20 blur-[120px] [background:radial-gradient(circle_at_center,hsl(var(--primary))_0,transparent_70%)]" />
        <div className="absolute top-[20%] -left-[10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <ResponsiveSection density="compact" className="flex flex-col items-center justify-center pt-12 pb-24 md:pt-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto px-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-8 shadow-sm">
            <Zap className="size-4 fill-primary" />
            <span>Yapay Zeka Destekli Hizmet Merkezi</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-8">
            Modern ve Akıllı <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Müşteri Deneyimi
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-12 leading-relaxed">
            İşletmemize hoş geldiniz. Siparişlerinizi takip etmek, ürünlerimize göz atmak veya 
            AI asistanımızdan destek almak için aşağıdan bir işlem seçin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10 rounded-2xl shadow-xl shadow-primary/25 text-base font-semibold group" asChild>
              <Link href="/auth/register">
                Hemen Üye Ol
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 rounded-2xl border-border/50 bg-background/50 backdrop-blur-md text-base font-semibold hover:bg-background/80 transition-all" asChild>
              <Link href="/auth/login">
                Müşteri Girişi
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 w-full px-4"
        >
          <AdaptiveGrid columns={4} className="gap-5 sm:gap-6">
            {serviceCards.map((card, index) => (
              <Link key={index} href={card.href} className="group outline-none">
                <Card className="h-full border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:bg-card/70 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden relative">
                  {/* Hover Accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.bgColor} ${card.color} shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                      {card.title}
                      <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </AdaptiveGrid>
        </motion.div>

        {/* Bottom Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 flex items-center gap-8 text-muted-foreground/40"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-5" />
            Güvenli Altyapı
          </div>
          <div className="h-4 w-px bg-border/40" />
          <div className="text-sm font-medium">7/24 AI Desteği</div>
          <div className="h-4 w-px bg-border/40" />
          <div className="text-sm font-medium">Hızlı Teslimat</div>
        </motion.div>
      </ResponsiveSection>
    </PageShell>
  );
}

// UI/UX İyileştirmeleri tamamlandı.
