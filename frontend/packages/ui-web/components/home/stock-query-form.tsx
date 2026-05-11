'use client';

import React, { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockQuery } from '@repo/domain/customer';

import { Alert, AlertDescription } from '../shadcn/alert';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { CustomerResultCard } from './customer-result-card';

export function StockQueryForm() {
  const [query, setQuery] = useState('');
  const { mutate, isLoading, data, error, reset } = useStockQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    await mutate({ query });
  };

  const handleReset = () => {
    setQuery('');
    reset();
  };

  if (data) {
    return (
      <div className="space-y-6">
        <CustomerResultCard
          title="Stok Durumu"
          status={data.inStock ? 'success' : 'error'}
          statusText={data.inStock ? 'Stokta Var' : 'Stokta Yok'}
          items={[
            { label: 'Ürün Adı', value: data.productName },
            { label: 'SKU (Stok Kodu)', value: data.sku },
            { label: 'Miktar', value: data.quantity > 0 ? `${data.quantity} Adet` : 'Tükendi' },
            ...(data.location ? [{ label: 'Depo Konumu', value: data.location }] : []),
          ]}
        />
        <Button variant="outline" onClick={handleReset} className="w-full">
          Yeni Sorgulama Yap
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="stockQuery" className="text-sm font-medium text-foreground/80">Ürün Adı veya SKU</Label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
            <Search className="size-5" />
          </div>
          <Input
            id="stockQuery"
            type="text"
            placeholder="Örn: iPhone 15 veya SKU-999"
            className="h-14 pl-11 pr-4 text-lg border-border/60 bg-background/50 transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Button 
        type="submit" 
        size="lg"
        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]" 
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 size-5 animate-spin" />
        ) : (
          <Search className="mr-2 size-5" />
        )}
        Stok Sorgula
      </Button>
    </form>
  );
}
