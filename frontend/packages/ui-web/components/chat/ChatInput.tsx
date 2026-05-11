"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ChatInputProps } from "@repo/ui-contracts";
import { SendHorizonal } from "lucide-react";

import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";

export function ChatInput({
  onSendMessage,
  isPending,
  disabled,
}: ChatInputProps) {
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
    <div className="border-t border-border/40 bg-background/95 p-4 backdrop-blur-md relative">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-4xl items-center gap-3 relative"
      >
        <Input
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Yapay zeka asistanına mesaj gönder..."
          disabled={isPending || disabled}
          className="flex-1 bg-muted/20 border-border/50 text-base py-6 px-5 rounded-full shadow-sm pr-14 focus-visible:ring-primary/20"
        />
        <Button
          type="submit"
          disabled={!content.trim() || isPending || disabled}
          size="icon"
          className="absolute right-2 h-10 w-10 rounded-full transition-all duration-200"
        >
          <SendHorizonal className="h-5 w-5" />
          <span className="sr-only">Gönder</span>
        </Button>
      </form>
    </div>
  );
}
