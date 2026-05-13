"use client";

import { cn } from "@repo/core";
import Image from "next/image";

/**
 * AiAssistantEmptyState — İlk açılışta veya sıfırlandıktan sonra görünür.
 */
export function AiAssistantEmptyState({ className }: AiAssistantEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-6 px-8 py-12 text-center",
        className,
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 shadow-inner overflow-hidden">
          <Image 
            src="/next-assets/logo-icon.svg" 
            alt="KOBİ Logo" 
            width={40} 
            height={40}
            className="object-contain animate-bounce"
            style={{ animationDuration: '3s' }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-[280px]">
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          Merhaba! Ben KOBİ AI
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          İşletmenizi büyütmek için buradayım. Siparişler, ürünler veya genel destek için her şeyi sorabilirsiniz.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {['Sipariş durumları', 'Stok takibi', 'Raporlar'].map((tag) => (
          <span key={tag} className="px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary hover:border-primary/20 cursor-default">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-bold text-primary/60 tracking-wider uppercase pt-4">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Yapay Zeka Destekli Sistem</span>
      </div>
    </div>
  );
}
