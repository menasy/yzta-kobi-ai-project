"use client";

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
    <div className="border-t border-border/40 bg-background/95 p-3 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 relative"
      >
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={isPending || disabled}
          className="flex-1 rounded-full border border-border/50 bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/50 disabled:opacity-50 pr-10 transition-colors"
          id="ai-assistant-input"
        />
        <Button
          type="submit"
          disabled={!content.trim() || isPending || disabled}
          size="icon"
          className="absolute right-1 h-8 w-8 rounded-full transition-all duration-200"
          id="ai-assistant-send-btn"
        >
          <SendHorizonal className="h-4 w-4" />
          <span className="sr-only">Gönder</span>
        </Button>
      </form>
    </div>
  );
}
