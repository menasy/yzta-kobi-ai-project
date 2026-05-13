'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Box, 
  Truck, 
  Bell,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { PageShell, ResponsiveSection, AdaptiveGrid } from '../layout';
import { Card, CardContent } from '../shadcn/card';
import { Button } from '../shadcn/button';

export function AdminHome() {
  const adminLinks = [
    {
      title: 'Genel Bakış',
      description: 'Satışlar, sipariş hacmi ve operasyonel verimlilik özetleri.',
      icon: <LayoutDashboard className="size-6" />,
      href: '/dashboard',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Sipariş Yönetimi',
      description: 'Aktif siparişlerin durumunu güncelleyin ve lojistik süreçleri başlatın.',
      icon: <ShoppingCart className="size-6" />,
      href: '/orders',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Ürün & Katalog',
      description: 'Yeni ürünler ekleyin, fiyatları güncelleyin ve kategorileri yönetin.',
      icon: <Package className="size-6" />,
      href: '/dashboard/products',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Envanter Kontrolü',
      description: 'Stok seviyelerini izleyin ve kritik envanter uyarılarını takip edin.',
      icon: <Box className="size-6" />,
      href: '/inventory',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Kargo & Lojistik',
      description: 'Kargo takip numaralarını tanımlayın ve teslimat durumlarını izleyin.',
      icon: <Truck className="size-6" />,
      href: '/shipments',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Sistem Mesajları',
      description: 'Önemli bildirimleri ve müşteri destek taleplerini görüntüleyin.',
      icon: <Bell className="size-6" />,
      href: '/notifications',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
  ];

  return (
    <PageShell className="relative min-h-[85vh] overflow-hidden bg-muted/10" containerSize="xl">
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-[100px]" />

      <ResponsiveSection density="compact" className="pt-10 md:pt-16 pb-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5" />
                  Yönetici Modu
                </div>
                <div className="h-1 w-1 rounded-full bg-border" />
                <div className="text-xs text-muted-foreground font-medium">Sistem Durumu: Aktif</div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Operasyon <span className="text-primary italic">Merkezi</span>
              </h1>
              <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
                İşletmenizi yapay zeka destekli araçlarla yönetin. Tüm süreçleri tek bir merkezden, 
                gerçek zamanlı verilerle kontrol altında tutun.
              </p>
            </div>
            
            <Button size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 group" asChild>
              <Link href="/dashboard">
                <Zap className="mr-2 size-5 fill-current" />
                Dashboard'a Git
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AdaptiveGrid columns={3} className="gap-6">
            {adminLinks.map((link, index) => (
              <Link key={index} href={link.href} className="group outline-none">
                <Card className="h-full border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:bg-card/90 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${link.bgColor} ${link.color} shadow-inner transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                      {link.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3 flex items-center justify-between">
                      {link.title}
                      <ArrowRight className="size-4 text-muted-foreground/0 -translate-x-4 group-hover:text-primary group-hover:text-muted-foreground/40 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {link.description}
                    </p>
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
