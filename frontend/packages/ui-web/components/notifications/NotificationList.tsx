"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { NotificationListItem } from "@repo/domain/notifications";

import { Skeleton } from "../shadcn/skeleton";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationItem } from "./NotificationItem";

interface NotificationListProps {
  notifications: NotificationListItem[];
  isLoading: boolean;
  onMarkRead?: (id: NotificationListItem["id"]) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

const contentVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

function NotificationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`skel-${String(i)}`}
          className="flex items-start gap-4 rounded-xl border border-border/30 p-4"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkRead,
  emptyTitle,
  emptyDescription,
}: NotificationListProps) {
  return (
    <div className="relative w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        {isLoading ? (
          <motion.div
            key="skeleton"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <NotificationListSkeleton />
          </motion.div>
        ) : notifications.length === 0 ? (
          <motion.div
            key="empty"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <NotificationEmptyState
              title={emptyTitle}
              description={emptyDescription}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full space-y-2.5"
          >
            {notifications.map((notification, index) => (
              <NotificationItem
                key={String(notification.id)}
                notification={notification}
                onMarkRead={onMarkRead}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
