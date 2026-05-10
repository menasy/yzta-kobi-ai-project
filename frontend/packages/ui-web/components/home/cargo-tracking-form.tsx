'use client';

import React, { useState } from 'react';
import { Loader2, Truck, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@repo/ui/components/shadcn/button';
import { Input } from '@repo/ui/components/shadcn/input';
import { Label } from '@repo/ui/components/shadcn/label';
import { Alert, AlertDescription } from '@repo/ui/components/shadcn/alert';
import { useCargoTracking } from '@repo/domain/customer';
import { CustomerResultCard } from './customer-result-card';

export function CargoTrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const { mutate, isLoading, data, error, reset } = useCargoTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    await mutate({ trackingNumber });
  };

  const handleReset = () => {
    setTrackingNumber('');
    reset();
  };

  if (data) {
    return (
      <div className="space-y-6">
        <CustomerResultCard
          title="Kargo Durumu"
          status={data.status === 'Dağıtıma Çıktı' ? 'warning' : 'info'}
          statusText={data.status}
          items={[
            { label: 'Takip Numarası', value: data.trackingNumber },
            { label: 'Kargo Firması', value: data.company },
            { label: 'Tahmini Teslimat', value: data.estimatedDelivery },
            { label: 'Son İşlem', value: data.lastUpdate },
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
        <Label htmlFor="trackingNumber" className="text-sm font-medium text-foreground/80">Takip Numarası</Label>
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
            <Truck className="size-5" />
          </div>
          <Input
            id="trackingNumber"
            type="text"
            placeholder="Örn: 1A2B3C4D5E"
            className="h-14 pl-11 pr-4 text-lg border-border/60 bg-background/50 transition-all duration-300 focus:bg-background focus:ring-2 focus:ring-primary/20"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
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
        disabled={isLoading || !trackingNumber.trim()}
      >
        {isLoading ? (
          <Loader2 className="mr-2 size-5 animate-spin" />
        ) : (
          <Search className="mr-2 size-5" />
        )}
        Takip Et
      </Button>
    </form>
  );
}
