"use client";

import { cn, formatRelativeTime } from "@repo/core";
import type {
  NotificationListItem,
  NotificationSeverity,
} from "@repo/domain/notifications";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Package } from "lucide-react";

/* ── Severity config ───────────────────────────────────────────────── */

type SeverityMeta = {
  Icon: typeof Info;
  iconBg: string;
  iconColor: string;
  dotBg: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  borderAccent: string;
};

const SEVERITY_MAP: Record<NotificationSeverity, SeverityMeta> = {
  info: {
    Icon: Info,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    dotBg: "bg-primary",
    badgeText: "Bilgi",
    badgeBg: "bg-primary/10",
    badgeColor: "text-primary",
    borderAccent: "border-l-primary/50",
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    dotBg: "bg-warning",
    badgeText: "Uyarı",
    badgeBg: "bg-warning/10",
    badgeColor: "text-warning",
    borderAccent: "border-l-warning/60",
  },
  critical: {
    Icon: Package,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    dotBg: "bg-destructive",
    badgeText: "Kritik",
    badgeBg: "bg-destructive/10",
    badgeColor: "text-destructive",
    borderAccent: "border-l-destructive/60",
  },
};

function getMeta(severity?: NotificationSeverity): SeverityMeta {
  return SEVERITY_MAP[severity ?? "info"];
}

/* ── Component ─────────────────────────────────────────────────────── */

interface NotificationItemProps {
  notification: NotificationListItem;
  onMarkRead?: (id: NotificationListItem["id"]) => void;
  index?: number;
}

export function NotificationItem({
  notification,
  onMarkRead,
  index = 0,
}: NotificationItemProps) {
  const meta = getMeta(notification.severity);
  const { Icon } = meta;
  const isRead = notification.is_read === true;

  const handleClick = () => {
    if (!isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <motion.button
      type="button"
      id={`notification-item-${String(notification.id)}`}
      onClick={handleClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: "easeOut" }}
      whileHover={{ scale: isRead ? 1 : 1.005 }}
      className={cn(
        // Base
        "group relative flex w-full items-start gap-4 rounded-xl border border-l-[3px] p-4 text-left transition-all duration-200",
        // Left accent border per severity
        meta.borderAccent,
        // Read state
        isRead
          ? "border-border/30 bg-background opacity-75 hover:opacity-90"
          : "border-border/60 bg-card shadow-sm hover:shadow-md hover:border-border",
      )}
    >
      {/* Unread dot */}
      {!isRead && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute right-3.5 top-3.5 h-2 w-2 rounded-full",
            meta.dotBg,
          )}
          aria-label="Okunmamış"
        />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
          isRead ? "bg-muted/50" : meta.iconBg,
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isRead ? "text-muted-foreground/50" : meta.iconColor,
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Title + badge row */}
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "text-sm font-semibold leading-snug",
              isRead ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {notification.title ?? "Bildirim"}
          </h3>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isRead ? "bg-muted/50 text-muted-foreground/60" : meta.badgeBg,
              isRead ? "" : meta.badgeColor,
            )}
          >
            {meta.badgeText}
          </span>
        </div>

        {/* Message */}
        {notification.message && (
          <p
            className={cn(
              "line-clamp-2 text-xs leading-relaxed",
              isRead ? "text-muted-foreground/60" : "text-muted-foreground",
            )}
          >
            {notification.message}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-3 pt-0.5">
          <time
            className="text-[11px] tabular-nums text-muted-foreground/50"
            dateTime={notification.created_at}
          >
            {notification.created_at
              ? formatRelativeTime(notification.created_at)
              : "—"}
          </time>

          {isRead ? (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/40">
              <CheckCircle2 className="h-3 w-3" />
              Okundu
            </span>
          ) : (
            <span className="text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Okundu işaretle →
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
