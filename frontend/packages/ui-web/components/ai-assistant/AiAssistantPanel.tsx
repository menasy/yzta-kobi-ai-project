"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@repo/core";
import { motion, AnimatePresence } from "framer-motion";
import type { AiAssistantPanelProps } from "@repo/ui-contracts";
import {
  useAiPanelOpen,
  useUIActions,
} from "@repo/state/stores/ui";

import { AiAssistantButton } from "./AiAssistantButton";
import { AiAssistantWindow } from "./AiAssistantWindow";

/**
 * AiAssistantPanel — Ana panel container.
 *
 * Desktop: Sağdan slide-in side panel (w-[420px]).
 * Mobile: Bottom'dan slide-up full-height drawer.
 *
 * Kapalıyken sağ altta floating button gösterir.
 * Animasyonlar framer-motion ile.
 */
export function AiAssistantPanel({ className }: AiAssistantPanelProps) {
  const isOpen = useAiPanelOpen();
  const { setAiPanelOpen } = useUIActions();

  const handleOpen = useCallback(() => {
    setAiPanelOpen(true);
  }, [setAiPanelOpen]);

  const handleClose = useCallback(() => {
    setAiPanelOpen(false);
  }, [setAiPanelOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen ? (
          <AiAssistantButton onClick={handleOpen} className={className} />
        ) : null}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen ? (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] md:hidden"
              onClick={handleClose}
              aria-hidden="true"
            />

            {/* Desktop: side panel | Mobile: bottom sheet */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { x: 0, y: 0, opacity: 1 },
                closed: { x: "100%", y: 0, opacity: 0.5 },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "fixed z-50",
                // Desktop: right side panel
                "hidden md:flex md:flex-col",
                "md:top-0 md:right-0 md:bottom-0",
                "md:w-[440px]",
                "md:border-l md:border-border/40",
                "md:bg-background/95 md:backdrop-blur-xl",
                "md:shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.1)]",
              )}
              id="ai-assistant-panel-desktop"
            >
              <AiAssistantWindow isOpen={isOpen} onClose={handleClose} />
            </motion.div>

            {/* Mobile variant */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { y: 0, opacity: 1 },
                closed: { y: "100%", opacity: 0.5 },
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "fixed z-50",
                // Mobile: bottom sheet
                "flex flex-col md:hidden",
                "inset-x-0 bottom-0",
                "h-[90dvh]",
                "rounded-t-[2.5rem]",
                "bg-background/98 backdrop-blur-xl",
                "shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)]",
                "border-t border-border/40",
              )}
              id="ai-assistant-panel-mobile"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-4 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
              </div>
              <AiAssistantWindow isOpen={isOpen} onClose={handleClose} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
