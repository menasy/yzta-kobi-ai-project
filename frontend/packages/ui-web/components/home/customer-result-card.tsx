import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@repo/core';
import { CustomerResultCardProps } from '@repo/ui-contracts';

export function CustomerResultCard({
  title,
  items,
  status = 'info',
  statusText,
}: CustomerResultCardProps) {
  const statusColors = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-card py-5">
        <h4 className="text-card-title font-bold text-foreground">{title}</h4>
        {statusText && (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-tight uppercase',
              statusColors[status]
            )}
          >
            {statusText}
          </span>
        )}
      </div>
      <div className="px-card py-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-1.5 transition-all duration-300 hover:translate-x-1">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{item.label}</dt>
              <dd className="text-base font-semibold text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  );
}
