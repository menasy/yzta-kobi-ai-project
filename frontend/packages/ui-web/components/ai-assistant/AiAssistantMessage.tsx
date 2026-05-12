"use client";

import { cn } from "@repo/core";
import { motion } from "framer-motion";
import type { AiAssistantMessageProps } from "@repo/ui-contracts";
import Image from "next/image";

/**
 * AiAssistantMessage — Kompakt tekil mesaj bileşeni.
 * Chat sayfasındakine benzer ama global panel için daha kompakt.
 */
export function AiAssistantMessage({ message, isOptimistic }: AiAssistantMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-3 px-4 py-2",
        isUser ? "flex-row-reverse" : "flex-row",
        isOptimistic && "opacity-60",
      )}
    >
      {/* Compact avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-background border border-border/50 text-foreground",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Image 
            src="/next-assets/logo-icon.svg" 
            alt="KOBİ Logo" 
            width={18} 
            height={18}
            className="object-contain"
          />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col px-4 py-3 text-[14px] leading-relaxed shadow-sm transition-all",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
            : "bg-muted/30 text-foreground border border-border/40 rounded-2xl rounded-tl-none backdrop-blur-sm",
        )}
      >
        <span className="whitespace-pre-wrap font-medium">{message.content}</span>
      </div>
    </motion.div>
  );
}
