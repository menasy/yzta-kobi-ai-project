"use client";

import { cn } from "@repo/core";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import type { AiAssistantTypingIndicatorProps } from "@repo/ui-contracts";

/**
 * AiAssistantTypingIndicator — Kompakt 3 nokta animasyonu.
 */
export function AiAssistantTypingIndicator({ className }: AiAssistantTypingIndicatorProps) {
  return (
    <div className={cn("flex w-full gap-2.5 px-3 py-1.5 flex-row", className)}>
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Bot className="h-3.5 w-3.5" />
      </div>

      <div className="flex items-center gap-1 rounded-2xl bg-muted/50 px-3.5 py-2.5 text-sm shadow-sm border border-border/40 rounded-tl-sm">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
      </div>
    </div>
  );
}
