"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@repo/ui";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-4 p-4 flex-row">
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex max-w-[80%] items-center gap-1.5 rounded-2xl bg-muted/50 px-5 py-4 text-sm shadow-sm border border-border/40 rounded-tl-sm">
        <motion.div
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
            delay: 0.2,
          }}
        />
        <motion.div
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
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
