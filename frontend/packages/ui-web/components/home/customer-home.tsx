'use client';

import React, { useState } from 'react';
import { Package, Box, Truck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerActionType } from '@repo/ui-contracts/home';
import { CustomerActionCard } from './customer-action-card';
import { CustomerActionPanel } from './customer-action-panel';

export function CustomerHome() {
  const [activeAction, setActiveAction] = useState<CustomerActionType>('order');

  const actions = [
    {
      type: 'order' as CustomerActionType,
      title: 'Sipariş sorgula',
      description: 'Sipariş numaranızla güncel durumu öğrenin.',
      icon: <Package className="size-5" />,
    },
    {
      type: 'stock' as CustomerActionType,
      title: 'Stok bilgisi sor',
      description: 'Ürün adı veya SKU ile stok durumunu kontrol edin.',
      icon: <Box className="size-5" />,
    },
    {
      type: 'cargo' as CustomerActionType,
      title: 'Kargo takip et',
      description: 'Takip numaranızla teslimat durumunu görüntüleyin.',
      icon: <Truck className="size-5" />,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-full -translate-x-1/2 opacity-20 blur-[100px] [background:radial-gradient(circle_at_center,hsl(var(--primary))_0,transparent_70%)]" />
      <div className="absolute -left-24 top-48 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-[60px]" />
      <div className="absolute -right-24 top-24 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[80px]" />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col items-center justify-center py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              Müşteri Destek Merkezi
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Nasıl yardımcı <span className="text-primary">olabiliriz?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              İşlemlerinizi saniyeler içinde gerçekleştirin. Sipariş, stok veya kargo bilgilerinize anında ulaşın.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
          >
            {actions.map((action, index) => (
              <CustomerActionCard
                key={action.type}
                type={action.type}
                title={action.title}
                description={action.description}
                icon={action.icon}
                isActive={activeAction === action.type}
                onClick={setActiveAction}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-12 w-full"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAction}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CustomerActionPanel activeType={activeAction} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
