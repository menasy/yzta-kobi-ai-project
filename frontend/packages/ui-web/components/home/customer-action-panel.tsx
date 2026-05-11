'use client';

import React from 'react';
import { CustomerActionType } from '@repo/ui-contracts';
import { OrderLookupForm } from './order-lookup-form';
import { StockQueryForm } from './stock-query-form';
import { CargoTrackingForm } from './cargo-tracking-form';
import { Card, CardContent } from '@repo/ui/components/shadcn/card';

interface CustomerActionPanelProps {
  activeType: CustomerActionType;
}

export function CustomerActionPanel({ activeType }: CustomerActionPanelProps) {
  return (
    <Card className="mx-auto w-full max-w-xl border-border/60 bg-card/80 backdrop-blur-md shadow-xl sm:shadow-2xl shadow-primary/5 ring-1 ring-border/5">
      <CardContent className="p-4 sm:p-card md:p-8">
        <div className="relative">
          {activeType === 'order' && <OrderLookupForm />}
          {activeType === 'stock' && <StockQueryForm />}
          {activeType === 'cargo' && <CargoTrackingForm />}
        </div>
      </CardContent>
    </Card>
  );
}
