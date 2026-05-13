"use client";

import {
  InventoryTable,
  LowStockAlerts,
  PageShell,
  ResponsiveSection,
} from "@repo/ui-web";
import { Box, AlertTriangle, ListFilter } from "lucide-react";
import { motion } from "framer-motion";

export default function InventoryPage() {
  return (
    <PageShell>
      <ResponsiveSection className="pt-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-1">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-0.5"
          >
            <div className="flex items-center gap-2 text-primary mb-1">
              <Box className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Yönetim Paneli</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              Stok Yönetimi
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Ürün stok durumlarını ve kritik seviyeleri buradan takip edin.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Stok Uyarıları */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-muted pb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Kritik Stok Uyarıları</h2>
            </div>
            <LowStockAlerts />
          </motion.section>

          {/* Stok Listesi */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-muted pb-3">
              <ListFilter className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Güncel Stok Listesi</h2>
            </div>
            <InventoryTable />
          </motion.section>
        </div>
      </ResponsiveSection>
    </PageShell>
  );
}
