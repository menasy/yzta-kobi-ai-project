'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  User, 
  ArrowRight,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { PageShell, ResponsiveSection, AdaptiveGrid } from '../layout';
import { Card, CardContent } from '../shadcn/card';
import { Button } from '../shadcn/button';

export function CustomerHome() {
  const customerLinks = [
    {
      title: 'Siparişlerim',
      description: 'Aktif siparişlerinizi takip edin, geçmiş sipariş detaylarını ve faturalarınızı inceleyin.',
      icon: <Package className="size-7" />,
      href: '/orders/my',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Ürünleri İncele',
      description: 'Size özel seçilen yeni ürünlerimizi keşfedin ve güvenle alışverişe başlayın.',
      icon: <ShoppingBag className="size-7" />,
      href: '/products',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'AI Asistan',
      description: '7/24 hizmet veren yapay zeka asistanımızla sesli veya yazılı iletişim kurun.',
      icon: <MessageSquare className="size-7" />,
      href: '/chat',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Hesap Ayarları',
      description: 'Profil bilgilerinizi, teslimat adreslerinizi ve bildirim tercihlerinizi yönetin.',
      icon: <User className="size-7" />,
      href: '/profile',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
  ];

  return (
    <PageShell className="relative min-h-[85vh] overflow-hidden" containerSize="lg">
      {/* Background Orbs */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-full -translate-x-1/2 opacity-20 blur-[100px] [background:radial-gradient(circle_at_center,hsl(var(--primary))_0,transparent_70%)]" />
      <div className="absolute -left-24 top-48 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-[60px]" />

      <ResponsiveSection density="compact" className="pt-12 md:pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-5 shadow-sm border border-primary/20">
                <Sparkles className="size-4 fill-primary" />
                <span>Hoş Geldiniz</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Müşteri <span className="text-primary italic">Paneli</span>
              </h1>
              <p className="mt-4 max-w-xl text-muted-foreground text-base sm:text-lg leading-relaxed">
                İşlemlerinizi hızlıca yönetin. AI asistan ile sipariş oluşturabilir ve 
                takip edebilirsiniz.
              </p>
            </div>
            
            <Button variant="outline" size="lg" className="rounded-2xl border-border/60 bg-background/50 backdrop-blur-sm hidden sm:flex" asChild>
              <Link href="/orders/my">
                <LayoutGrid className="mr-2 size-5" />
                Tüm Siparişlerim
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AdaptiveGrid columns={2} className="gap-6 sm:gap-8">
            {customerLinks.map((link, index) => (
              <Link key={index} href={link.href} className="group outline-none">
                <Card className="h-full border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:bg-card/80 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-8 sm:p-10 relative z-10">
                    <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${link.bgColor} ${link.color} shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                        {link.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-2xl font-bold text-foreground">
                            {link.title}
                          </h3>
                          <ArrowRight className="size-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                        <p className="text-base text-muted-foreground/80 leading-relaxed">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </AdaptiveGrid>
        </motion.div>
      </ResponsiveSection>
    </PageShell>
  );
}
