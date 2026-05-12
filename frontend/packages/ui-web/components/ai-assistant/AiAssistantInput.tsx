"use client";

import { cn } from "@repo/core";
import { useState, useRef, useEffect } from "react";
import type { AiAssistantInputProps } from "@repo/ui-contracts";
import { SendHorizonal } from "lucide-react";

import { Button } from "../shadcn/button";

/**
 * AiAssistantInput — Kompakt mesaj giriş alanı.
 * Enter ile gönderir, boş mesaj engelini kontrol eder.
 */
export function AiAssistantInput({
  onSendMessage,
  isPending,
  disabled,
}: AiAssistantInputProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending && !disabled) {
      inputRef.current?.focus();
    }
  }, [isPending, disabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (content.trim() && !isPending && !disabled) {
      onSendMessage(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 relative group"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            disabled={isPending || disabled}
            className={cn(
              "relative w-full rounded-[1.5rem] border border-border/60 bg-background/50 px-5 py-3.5 text-[14px]",
              "text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "disabled:opacity-50 transition-all shadow-sm backdrop-blur-md",
            )}
            id="ai-assistant-input"
          />
        </div>

        <Button
          type="submit"
          disabled={!content.trim() || isPending || disabled}
          size="icon"
          className={cn(
            "h-[46px] w-[46px] rounded-2xl transition-all duration-300 shadow-lg flex-shrink-0",
            content.trim() 
              ? "bg-primary text-primary-foreground scale-100 shadow-primary/20 hover:shadow-primary/40" 
              : "bg-muted text-muted-foreground scale-95 opacity-50 shadow-none"
          )}
          id="ai-assistant-send-btn"
        >
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">Gönder</span>
        </Button>
      </form>
    </div>
  );
}
