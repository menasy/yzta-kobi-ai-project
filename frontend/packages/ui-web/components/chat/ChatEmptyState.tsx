"use client";

import { MessageSquarePlus, Sparkles } from "lucide-react";

import { Button } from "../shadcn/button";

interface ChatEmptyStateProps {
  onNewChat?: () => void;
}

export function ChatEmptyState({ onNewChat }: ChatEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            KOBİ AI Asistanı
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Sipariş takibi, stok durumu, kargo bilgisi ve daha fazlası için
            AI asistanınızla sohbet edin.
          </p>
        </div>

        {/* Action */}
        {onNewChat && (
          <Button
            onClick={onNewChat}
            className="mt-2 gap-2"
            variant="default"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Yeni Sohbet Başlat
          </Button>
        )}
      </div>
    </div>
  );
}
