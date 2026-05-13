"use client";

import { cn } from "@repo/core";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Loader2, Sparkles } from "lucide-react";

import { Button } from "../shadcn/button";
import { Skeleton } from "../shadcn/skeleton";

interface NotificationHeaderProps {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllRead: () => void;
  dailySummary?: string | null;
  isDailySummaryLoading?: boolean;
}

export function NotificationHeader({
  unreadCount,
  isMarkingAll,
  onMarkAllRead,
  dailySummary,
  isDailySummaryLoading = false,
}: NotificationHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ── Title + Actions row ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: icon + title + badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Bell className="h-5 w-5 text-primary" />
            {/* Live SSE indicator */}
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Bildirimler
              </h1>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-muted-foreground">
              Sistem ve operasyon bildirimleri — canlı akış aktif
            </p>
          </div>
        </div>

        {/* Right: mark all button */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllRead}
                disabled={isMarkingAll}
                className={cn(
                  "gap-2 border-border/60 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                  isMarkingAll && "opacity-75",
                )}
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
                Tümünü Okundu Yap
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Daily summary card ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isDailySummaryLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 rounded-xl border border-border/30 bg-muted/20 p-3">
              <Skeleton className="mt-0.5 h-4 w-4 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </motion.div>
        )}

        {dailySummary && !isDailySummaryLoading && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent p-3.5"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                Günlük Özet
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">
                {dailySummary}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
