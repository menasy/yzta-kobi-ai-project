'use client';

import React, { useState } from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrderLookup } from '@repo/domain/customer';

import { Alert, AlertDescription } from '../shadcn/alert';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { CustomerResultCard } from './customer-result-card';

export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const { mutate, isLoading, data, error, reset } = useOrderLookup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    await mutate({ orderNumber });
  };

  const handleReset = () => {
    setOrderNumber('');
    reset();
  };

  if (data) {
    return (
      <div className="space-y-6">
        <CustomerResultCard
          title="Sipariş Detayı"
          status={data.status === 'Teslim Edildi' ? 'success' : 'info'}
          statusText={data.status}
          items={[
            { label: 'Sipariş Numarası', value: data.orderNumber },
            { label: 'Sipariş Tarihi', value: data.date },
            { label: 'Toplam Tutar', value: data.total },
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
        <Label htmlFor="orderNumber" className="text-sm font-medium text-foreground/80">
          Sipariş Numarası
        </Label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
            <Package className="size-5" />
          </div>
          <Input
            id="orderNumber"
            type="text"
            placeholder="Örn: ORD-12345"
            className="h-14 pl-11 pr-4 text-lg border-border/60 bg-background/50 transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground pl-1">
          Sipariş onay e-postanızda yer alan numarayı giriniz.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Button 
        type="submit" 
        size="lg"
        className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]" 
        disabled={isLoading || !orderNumber.trim()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 size-5 animate-spin" />
        ) : (
          <Search className="mr-2 size-5" />
        )}
        Sorgula
      </Button>
    </form>
  );
}
