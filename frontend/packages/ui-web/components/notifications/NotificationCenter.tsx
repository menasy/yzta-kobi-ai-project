"use client";

import { cn } from "@repo/core";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationDailySummary,
  useNotifications,
  useNotificationStream,
  useUnreadNotifications,
} from "@repo/domain/notifications";
import type { NotificationListItem } from "@repo/domain/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useIsAuthenticated, useIsSessionLoading } from "@repo/state/stores/auth";
import { useCallback, useId, useRef, useState } from "react";

import { Button } from "../shadcn/button";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationList } from "./NotificationList";

type NotificationTab = "all" | "unread";

const TABS: { id: NotificationTab; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "unread", label: "Okunmamış" },
];

/* ── List content animation ──────────────────────────────────────────── */
const listVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -24 : 24,
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  }),
};

export function NotificationCenter() {
  const tabGroupId = useId();
  const isAuthenticated = useIsAuthenticated();
  const isSessionLoading = useIsSessionLoading();
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const prevTabRef = useRef<NotificationTab>("all");
  const direction = activeTab === "unread" ? 1 : -1;

  /* ── Queries ─────────────────────────────────────────────────────── */
  const {
    notifications: allNotifications,
    isLoading: isAllLoading,
    isError: isAllError,
    refetch: refetchAll,
  } = useNotifications({ enabled: isAuthenticated && !isSessionLoading });

  const {
    notifications: unreadNotifications,
    unreadCount,
    isLoading: isUnreadLoading,
    isError: isUnreadError,
    refetch: refetchUnread,
  } = useUnreadNotifications({ enabled: isAuthenticated && !isSessionLoading });

  const {
    summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useNotificationDailySummary({
    enabled: isAuthenticated && !isSessionLoading,
  });

  /* ── Mutations ───────────────────────────────────────────────────── */
  const { markNotificationRead, isPending: isMarkingOne } =
    useMarkNotificationRead();
  const { markAllNotificationsRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();

  /* ── SSE Stream ──────────────────────────────────────────────────── */
  useNotificationStream({ enabled: isAuthenticated && !isSessionLoading });

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleMarkRead = useCallback(
    (id: NotificationListItem["id"]) => {
      if (isMarkingOne) return;
      markNotificationRead(id);
    },
    [markNotificationRead, isMarkingOne],
  );

  const handleMarkAllRead = useCallback(() => {
    if (isMarkingAll) return;
    markAllNotificationsRead();
  }, [markAllNotificationsRead, isMarkingAll]);

  const handleTabChange = (tab: NotificationTab) => {
    prevTabRef.current = activeTab;
    setActiveTab(tab);
  };

  /* ── Derived state ───────────────────────────────────────────────── */
  const isAllTab = activeTab === "all";
  const displayedNotifications = isAllTab
    ? allNotifications
    : unreadNotifications;
  const isLoading =
    isSessionLoading || (isAllTab ? isAllLoading : isUnreadLoading);
  const isError = isAllTab ? isAllError : isUnreadError;

  const handleRetry = () => {
    if (isAllTab) void refetchAll();
    else void refetchUnread();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <NotificationHeader
        unreadCount={unreadCount}
        isMarkingAll={isMarkingAll}
        onMarkAllRead={handleMarkAllRead}
        dailySummary={isSummaryError ? null : summary}
        isDailySummaryLoading={isSummaryLoading}
      />

      {/* Animated Tab Bar */}
      <div
        role="tablist"
        aria-label="Bildirim sekmeleri"
        className="relative flex items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-1 shadow-inner"
      >
        {/* Animated sliding indicator */}
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`${tabGroupId}-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tabGroupId}-panel-${tab.id}`}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {/* Animated background pill */}
              {isActive && (
                <motion.span
                  layoutId={`${tabGroupId}-pill`}
                  className="absolute inset-0 rounded-lg bg-primary shadow-md shadow-primary/20"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}

              <span className="relative z-10">{tab.label}</span>

              {/* Unread badge on Okunmamış tab */}
              {tab.id === "unread" && unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "relative z-10 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ring-2",
                    isActive 
                      ? "bg-primary-foreground text-primary ring-primary" 
                      : "bg-primary text-primary-foreground ring-muted/30"
                  )}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Tab Content */}
      <div
        id={`${tabGroupId}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${tabGroupId}-tab-${activeTab}`}
        className="relative"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={listVariants}
            initial="enter"
            animate="center"
            exit="exit"
            layout="position"
            className="w-full origin-top"
          >
            {isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 rounded-xl border border-dashed border-border/60 bg-muted/5">
                <div className="p-3 rounded-full bg-destructive/10">
                  <Bell className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Yükleme Hatası
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Bildirimler alınırken bir sorun oluştu.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="h-8 px-4"
                >
                  Yeniden Dene
                </Button>
              </div>
            ) : (
              <NotificationList
                notifications={displayedNotifications}
                isLoading={isLoading}
                onMarkRead={handleMarkRead}
                emptyTitle={isAllTab ? "Bildirim yok" : "Okunmamış bildirim yok"}
                emptyDescription={
                  isAllTab
                    ? "Henüz hiç bildiriminiz bulunmuyor."
                    : "Tüm bildirimlerinizi okudunuz."
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
