"use client";

import { cn } from "@repo/core";
import type { AiAssistantButtonProps } from "@repo/ui-contracts";
import { motion } from "framer-motion";

/**
 * AiAssistantButton — Sağ alt köşede kayan AI buton.
 * Panel kapalıyken görünür, tıklanınca paneli açar.
 */
export function AiAssistantButton({ onClick, className }: AiAssistantButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "fixed bottom-6 right-20 z-50",
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg overflow-hidden border-2 border-primary/20",
        "hover:shadow-xl hover:shadow-primary/30",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label="AI Asistan panelini aç"
      id="ai-assistant-fab"
    >
      <div className="relative h-7 w-7">
        <img
          src="/next-assets/logo-icon.svg" 
          alt="KOBİ Logo" 
          className="h-full w-full object-contain invert brightness-0"
        />
      </div>
    </motion.button>
  );
}
